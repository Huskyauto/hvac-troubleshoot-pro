import { relations } from "drizzle-orm";
import { boolean, index, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "pro"]).default("user").notNull(),
  phone: varchar("phone", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Organizations (contractors, supply houses)
 */
export const orgs = mysqlTable("orgs", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 120 }).notNull(),
  type: varchar("type", { length: 32 }).notNull(), // contractor, supply_house
  createdAt: timestamp("createdAt").defaultNow(),
});

/**
 * Device models (equipment specifications)
 */
export const deviceModels = mysqlTable("device_models", {
  id: int("id").primaryKey().autoincrement(),
  brand: varchar("brand", { length: 80 }).notNull(),
  modelNumber: varchar("modelNumber", { length: 120 }).notNull(),
  equipmentType: varchar("equipmentType", { length: 80 }).notNull(), // furnace, mini_split, etc.
  specs: json("specs").$type<Record<string, any>>(),
  oemManualUrl: varchar("oemManualUrl", { length: 1024 }),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  modelNumberIdx: index("modelNumberIdx").on(table.modelNumber),
  brandIdx: index("brandIdx").on(table.brand),
}));

export type DeviceModel = typeof deviceModels.$inferSelect;

/**
 * User's registered devices
 */
export const devices = mysqlTable("devices", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  nickname: varchar("nickname", { length: 120 }),
  type: varchar("type", { length: 80 }).notNull(),
  modelId: int("modelId"),
  serial: varchar("serial", { length: 120 }),
  locationAddress: varchar("locationAddress", { length: 512 }),
  installedAt: timestamp("installedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Device = typeof devices.$inferSelect;

/**
 * Error codes database
 */
export const errorCodes = mysqlTable("error_codes", {
  id: int("id").primaryKey().autoincrement(),
  modelId: int("modelId"),
  code: varchar("code", { length: 64 }).notNull(),
  description: varchar("description", { length: 1024 }).notNull(),
  likelyCauses: json("likelyCauses").$type<string[]>().notNull(),
  severity: varchar("severity", { length: 16 }).notNull(), // low, medium, high, critical
  safetyGate: varchar("safetyGate", { length: 32 }),
}, (table) => ({
  codeIdx: index("codeIdx").on(table.code),
}));

export type ErrorCode = typeof errorCodes.$inferSelect;

/**
 * Diagnostic sessions
 */
export const diagnosticSessions = mysqlTable("diagnostic_sessions", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  deviceId: int("deviceId"),
  symptom: text("symptom").notNull(),
  errorCodesInput: json("errorCodesInput").$type<string[]>(),
  startedAt: timestamp("startedAt").defaultNow(),
  status: varchar("status", { length: 32 }).default("active").notNull(), // active, completed, abandoned
  resultRankedCauses: json("resultRankedCauses").$type<any[]>(),
  completedAt: timestamp("completedAt"),
});

export type DiagnosticSession = typeof diagnosticSessions.$inferSelect;

/**
 * Diagnostic steps within a session
 */
export const diagnosticSteps = mysqlTable("diagnostic_steps", {
  id: int("id").primaryKey().autoincrement(),
  sessionId: int("sessionId").notNull(),
  stepIndex: int("stepIndex").notNull(),
  instructionMd: text("instructionMd").notNull(),
  requiredTools: json("requiredTools").$type<string[]>(),
  expectedReadings: json("expectedReadings").$type<Record<string, any>>(),
  outcome: varchar("outcome", { length: 16 }), // pass, fail, skip
  evidenceUrl: varchar("evidenceUrl", { length: 1024 }),
  measurement: json("measurement").$type<Record<string, any>>(),
  completedAt: timestamp("completedAt"),
});

export type DiagnosticStep = typeof diagnosticSteps.$inferSelect;

/**
 * Parts catalog
 */
export const parts = mysqlTable("parts", {
  id: int("id").primaryKey().autoincrement(),
  oemPartNo: varchar("oemPartNo", { length: 120 }).notNull(),
  mfr: varchar("mfr", { length: 120 }).notNull(),
  description: varchar("description", { length: 1024 }).notNull(),
  equipmentTypes: json("equipmentTypes").$type<string[]>(),
  specs: json("specs").$type<Record<string, any>>(),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  oemPartNoIdx: index("oemPartNoIdx").on(table.oemPartNo),
}));

export type Part = typeof parts.$inferSelect;

/**
 * Part compatibility with device models
 */
export const partCompatibility = mysqlTable("part_compatibility", {
  partId: int("partId").notNull(),
  modelId: int("modelId").notNull(),
  isOem: boolean("isOem").default(true),
  isAftermarket: boolean("isAftermarket").default(false),
  notes: varchar("notes", { length: 1024 }),
}, (table) => ({
  pk: index("pk").on(table.partId, table.modelId),
}));

/**
 * Suppliers (supply houses, distributors)
 */
export const suppliers = mysqlTable("suppliers", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  chain: varchar("chain", { length: 120 }), // Ferguson, Johnstone, etc.
  contact: json("contact").$type<{ phone?: string; email?: string; website?: string }>(),
  apiConfig: json("apiConfig").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Supplier = typeof suppliers.$inferSelect;

/**
 * Supplier locations (physical stores)
 */
export const supplierLocations = mysqlTable("supplier_locations", {
  id: int("id").primaryKey().autoincrement(),
  supplierId: int("supplierId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 512 }).notNull(),
  city: varchar("city", { length: 120 }),
  state: varchar("state", { length: 32 }),
  zipCode: varchar("zipCode", { length: 16 }),
  lat: varchar("lat", { length: 32 }),
  lng: varchar("lng", { length: 32 }),
  phone: varchar("phone", { length: 32 }),
  hours: json("hours").$type<Record<string, string>>(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type SupplierLocation = typeof supplierLocations.$inferSelect;

/**
 * Inventory snapshots (cached from supplier APIs)
 */
export const inventorySnapshots = mysqlTable("inventory_snapshots", {
  id: int("id").primaryKey().autoincrement(),
  partId: int("partId").notNull(),
  supplierLocationId: int("supplierLocationId").notNull(),
  stockLevel: int("stockLevel").default(0).notNull(),
  priceCents: int("priceCents"),
  stockStatus: varchar("stockStatus", { length: 32 }), // in_stock, low_stock, out_of_stock, order_only
  updatedAt: timestamp("updatedAt").defaultNow(),
}, (table) => ({
  partSupplierIdx: index("partSupplierIdx").on(table.partId, table.supplierLocationId),
}));

export type InventorySnapshot = typeof inventorySnapshots.$inferSelect;

/**
 * Shopping carts
 */
export const carts = mysqlTable("carts", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

/**
 * Cart items
 */
export const cartItems = mysqlTable("cart_items", {
  cartId: int("cartId").notNull(),
  partId: int("partId").notNull(),
  qty: int("qty").default(1).notNull(),
  priceCents: int("priceCents"),
  supplierLocationId: int("supplierLocationId"),
}, (table) => ({
  pk: index("pk").on(table.cartId, table.partId),
}));

/**
 * Orders
 */
export const orders = mysqlTable("orders", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  supplierLocationId: int("supplierLocationId"),
  status: varchar("status", { length: 32 }).default("created").notNull(), // created, reserved, completed, cancelled
  totalCents: int("totalCents"),
  externalRef: varchar("externalRef", { length: 255 }),
  placedAt: timestamp("placedAt").defaultNow(),
});

export type Order = typeof orders.$inferSelect;

/**
 * Documents for RAG (manuals, service bulletins, etc.)
 */
export const docs = mysqlTable("docs", {
  id: int("id").primaryKey().autoincrement(),
  source: varchar("source", { length: 120 }), // manual, service_bulletin, forum, etc.
  title: varchar("title", { length: 512 }),
  url: varchar("url", { length: 1024 }),
  equipmentTypes: json("equipmentTypes").$type<string[]>(),
  brand: varchar("brand", { length: 120 }),
  modelLike: varchar("modelLike", { length: 120 }),
  modelId: int("modelId"), // Link to device_models table
  checksum: varchar("checksum", { length: 120 }),
  blobUrl: varchar("blobUrl", { length: 1024 }),
  fileSize: int("fileSize"), // File size in bytes
  pageCount: int("pageCount"), // Number of pages in PDF
  accessCount: int("accessCount").default(0), // Track how many times accessed
  lastAccessedAt: timestamp("lastAccessedAt"), // Last time this manual was accessed
  createdAt: timestamp("createdAt").defaultNow(),
  uploadedBy: varchar("uploadedBy", { length: 64 }), // User who uploaded/added this
});

export type Doc = typeof docs.$inferSelect;

/**
 * Document chunks for vector search
 */
export const docChunks = mysqlTable("doc_chunks", {
  id: int("id").primaryKey().autoincrement(),
  docId: int("docId").notNull(),
  chunkIdx: int("chunkIdx").notNull(),
  text: text("text").notNull(),
  // Note: MySQL doesn't have native vector type, we'll store embeddings externally or use JSON
  embeddingVector: json("embeddingVector").$type<number[]>(),
});

export type DocChunk = typeof docChunks.$inferSelect;

/**
 * AI invocations log
 */
export const aiInvocations = mysqlTable("ai_invocations", {
  id: int("id").primaryKey().autoincrement(),
  sessionId: int("sessionId"),
  tool: varchar("tool", { length: 120 }),
  promptHash: varchar("promptHash", { length: 120 }),
  input: json("input").$type<Record<string, any>>(),
  output: json("output").$type<Record<string, any>>(),
  costUsd: int("costUsd"), // stored as cents
  createdAt: timestamp("createdAt").defaultNow(),
});

