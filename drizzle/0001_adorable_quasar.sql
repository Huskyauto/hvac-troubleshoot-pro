CREATE TABLE `ai_invocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int,
	`tool` varchar(120),
	`promptHash` varchar(120),
	`input` json,
	`output` json,
	`costUsd` int,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `ai_invocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`cartId` int NOT NULL,
	`partId` int NOT NULL,
	`qty` int NOT NULL DEFAULT 1,
	`priceCents` int,
	`supplierLocationId` int
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `carts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `device_models` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brand` varchar(80) NOT NULL,
	`modelNumber` varchar(120) NOT NULL,
	`equipmentType` varchar(80) NOT NULL,
	`specs` json,
	`oemManualUrl` varchar(1024),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `device_models_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`nickname` varchar(120),
	`type` varchar(80) NOT NULL,
	`modelId` int,
	`serial` varchar(120),
	`locationAddress` varchar(512),
	`installedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `devices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diagnostic_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`deviceId` int,
	`symptom` text NOT NULL,
	`errorCodesInput` json,
	`startedAt` timestamp DEFAULT (now()),
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`resultRankedCauses` json,
	`completedAt` timestamp,
	CONSTRAINT `diagnostic_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diagnostic_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`stepIndex` int NOT NULL,
	`instructionMd` text NOT NULL,
	`requiredTools` json,
	`expectedReadings` json,
	`outcome` varchar(16),
	`evidenceUrl` varchar(1024),
	`measurement` json,
	`completedAt` timestamp,
	CONSTRAINT `diagnostic_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doc_chunks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`docId` int NOT NULL,
	`chunkIdx` int NOT NULL,
	`text` text NOT NULL,
	`embeddingVector` json,
	CONSTRAINT `doc_chunks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `docs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(120),
	`title` varchar(512),
	`url` varchar(1024),
	`equipmentTypes` json,
	`brand` varchar(120),
	`modelLike` varchar(120),
	`checksum` varchar(120),
	`blobUrl` varchar(1024),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `docs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `error_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modelId` int,
	`code` varchar(64) NOT NULL,
	`description` varchar(1024) NOT NULL,
	`likelyCauses` json NOT NULL,
	`severity` varchar(16) NOT NULL,
	`safetyGate` varchar(32),
	CONSTRAINT `error_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partId` int NOT NULL,
	`supplierLocationId` int NOT NULL,
	`stockLevel` int NOT NULL DEFAULT 0,
	`priceCents` int,
	`stockStatus` varchar(32),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `inventory_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`supplierLocationId` int,
	`status` varchar(32) NOT NULL DEFAULT 'created',
	`totalCents` int,
	`externalRef` varchar(255),
	`placedAt` timestamp DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orgs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`type` varchar(32) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `orgs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `part_compatibility` (
	`partId` int NOT NULL,
	`modelId` int NOT NULL,
	`isOem` boolean DEFAULT true,
	`isAftermarket` boolean DEFAULT false,
	`notes` varchar(1024)
);
--> statement-breakpoint
CREATE TABLE `parts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`oemPartNo` varchar(120) NOT NULL,
	`mfr` varchar(120) NOT NULL,
	`description` varchar(1024) NOT NULL,
	`equipmentTypes` json,
	`specs` json,
	`imageUrl` varchar(1024),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `parts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplier_locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supplierId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(512) NOT NULL,
	`city` varchar(120),
	`state` varchar(32),
	`zipCode` varchar(16),
	`lat` varchar(32),
	`lng` varchar(32),
	`phone` varchar(32),
	`hours` json,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `supplier_locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`chain` varchar(120),
	`contact` json,
	`apiConfig` json,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','pro') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
CREATE INDEX `pk` ON `cart_items` (`cartId`,`partId`);--> statement-breakpoint
CREATE INDEX `modelNumberIdx` ON `device_models` (`modelNumber`);--> statement-breakpoint
CREATE INDEX `brandIdx` ON `device_models` (`brand`);--> statement-breakpoint
CREATE INDEX `codeIdx` ON `error_codes` (`code`);--> statement-breakpoint
CREATE INDEX `partSupplierIdx` ON `inventory_snapshots` (`partId`,`supplierLocationId`);--> statement-breakpoint
CREATE INDEX `pk` ON `part_compatibility` (`partId`,`modelId`);--> statement-breakpoint
CREATE INDEX `oemPartNoIdx` ON `parts` (`oemPartNo`);