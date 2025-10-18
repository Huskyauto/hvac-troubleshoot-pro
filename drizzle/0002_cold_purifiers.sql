ALTER TABLE `docs` ADD `modelId` int;--> statement-breakpoint
ALTER TABLE `docs` ADD `fileSize` int;--> statement-breakpoint
ALTER TABLE `docs` ADD `pageCount` int;--> statement-breakpoint
ALTER TABLE `docs` ADD `accessCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `docs` ADD `lastAccessedAt` timestamp;--> statement-breakpoint
ALTER TABLE `docs` ADD `uploadedBy` varchar(64);