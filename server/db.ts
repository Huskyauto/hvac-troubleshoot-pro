import { eq, like, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  deviceModels, 
  devices, 
  errorCodes, 
  diagnosticSessions, 
  diagnosticSteps,
  parts,
  partCompatibility,
  suppliers,
  supplierLocations,
  inventorySnapshots,
  carts,
  cartItems,
  orders,
  docs,
  docChunks,
  aiInvocations,
  DeviceModel,
  Device,
  ErrorCode,
  DiagnosticSession,
  Part,
  Supplier,
  SupplierLocation,
  InventorySnapshot,
  Doc
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= User Management =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= Equipment & Models =============

export async function searchDeviceModels(query: string): Promise<DeviceModel[]> {
  const db = await getDb();
  if (!db) return [];

  const searchPattern = `%${query}%`;
  const results = await db
    .select()
    .from(deviceModels)
    .where(
      sql`${deviceModels.modelNumber} LIKE ${searchPattern} OR ${deviceModels.brand} LIKE ${searchPattern}`
    )
    .limit(10);

  return results;
}

export async function getDeviceModel(id: number): Promise<DeviceModel | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(deviceModels).where(eq(deviceModels.id, id)).limit(1);
  return result[0];
}

export async function createDeviceModel(model: typeof deviceModels.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(deviceModels).values(model);
  return result;
}

export async function getUserDevices(userId: string): Promise<Device[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(devices).where(eq(devices.userId, userId));
}

export async function createDevice(device: typeof devices.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(devices).values(device);
  return result;
}

export async function getDevice(id: number): Promise<Device | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(devices).where(eq(devices.id, id)).limit(1);
  return result[0];
}

// ============= Error Codes =============

export async function searchErrorCodes(code: string, modelId?: number): Promise<ErrorCode[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [like(errorCodes.code, `%${code}%`)];
  
  if (modelId) {
    conditions.push(eq(errorCodes.modelId, modelId));
  }

  return await db.select().from(errorCodes).where(and(...conditions)).limit(20);
}

export async function getErrorCodesByModel(modelId: number): Promise<ErrorCode[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(errorCodes).where(eq(errorCodes.modelId, modelId));
}

// ============= Diagnostics =============

export async function createDiagnosticSession(session: typeof diagnosticSessions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(diagnosticSessions).values(session);
  return result;
}

export async function getDiagnosticSession(id: number): Promise<DiagnosticSession | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(diagnosticSessions).where(eq(diagnosticSessions.id, id)).limit(1);
  return result[0];
}

export async function updateDiagnosticSession(id: number, updates: Partial<DiagnosticSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(diagnosticSessions).set(updates).where(eq(diagnosticSessions.id, id));
}

export async function getUserDiagnosticSessions(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(diagnosticSessions)
    .where(eq(diagnosticSessions.userId, userId))
    .orderBy(desc(diagnosticSessions.startedAt))
    .limit(50);
}

export async function createDiagnosticStep(step: typeof diagnosticSteps.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(diagnosticSteps).values(step);
}

export async function getSessionSteps(sessionId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(diagnosticSteps)
    .where(eq(diagnosticSteps.sessionId, sessionId))
    .orderBy(diagnosticSteps.stepIndex);
}

export async function updateDiagnosticStep(id: number, updates: Partial<typeof diagnosticSteps.$inferSelect>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(diagnosticSteps).set(updates).where(eq(diagnosticSteps.id, id));
}

// ============= Parts =============

export async function searchParts(query: string, equipmentType?: string): Promise<Part[]> {
  const db = await getDb();
  if (!db) return [];

  const searchPattern = `%${query}%`;
  let dbQuery = db
    .select()
    .from(parts)
    .where(
      sql`${parts.oemPartNo} LIKE ${searchPattern} OR ${parts.description} LIKE ${searchPattern}`
    );

  return await dbQuery.limit(50);
}

export async function getPart(id: number): Promise<Part | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(parts).where(eq(parts.id, id)).limit(1);
  return result[0];
}

export async function getPartsByModel(modelId: number): Promise<Part[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: parts.id,
      oemPartNo: parts.oemPartNo,
      mfr: parts.mfr,
      description: parts.description,
      equipmentTypes: parts.equipmentTypes,
      specs: parts.specs,
      imageUrl: parts.imageUrl,
      createdAt: parts.createdAt,
    })
    .from(parts)
    .innerJoin(partCompatibility, eq(parts.id, partCompatibility.partId))
    .where(eq(partCompatibility.modelId, modelId));

  return result;
}

// ============= Suppliers & Inventory =============

export async function getSuppliers(): Promise<Supplier[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(suppliers);
}

export async function getSupplierLocations(supplierId?: number): Promise<SupplierLocation[]> {
  const db = await getDb();
  if (!db) return [];

  if (supplierId) {
    return await db.select().from(supplierLocations).where(eq(supplierLocations.supplierId, supplierId));
  }

  return await db.select().from(supplierLocations);
}

export async function searchInventory(partId: number, userLat?: string, userLng?: string): Promise<InventorySnapshot[]> {
  const db = await getDb();
  if (!db) return [];

  // For now, return all inventory for the part
  // TODO: Add distance calculation when lat/lng provided
  return await db
    .select()
    .from(inventorySnapshots)
    .where(eq(inventorySnapshots.partId, partId))
    .orderBy(desc(inventorySnapshots.stockLevel));
}

export async function updateInventorySnapshot(snapshot: typeof inventorySnapshots.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(inventorySnapshots).values(snapshot).onDuplicateKeyUpdate({
    set: {
      stockLevel: snapshot.stockLevel,
      priceCents: snapshot.priceCents,
      stockStatus: snapshot.stockStatus,
      updatedAt: new Date(),
    },
  });
}

// ============= Shopping Cart =============

export async function getUserCart(userId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  return result[0] || null;
}

export async function createCart(userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(carts).values({ userId });
  return result;
}

export async function getCartItems(cartId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
}

export async function addToCart(item: typeof cartItems.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(cartItems).values(item).onDuplicateKeyUpdate({
    set: {
      qty: sql`qty + ${item.qty}`,
    },
  });
}

// ============= Documents (RAG) =============

export async function searchDocuments(query: string, brand?: string, equipmentType?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (brand) {
    conditions.push(eq(docs.brand, brand));
  }

  if (conditions.length > 0) {
    return await db.select().from(docs).where(and(...conditions)).limit(20);
  }

  return await db.select().from(docs).limit(20);
}

export async function getDocChunks(docId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(docChunks).where(eq(docChunks.docId, docId));
}

export async function createDoc(doc: typeof docs.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(docs).values(doc);
}

export async function getDocByChecksum(checksum: string): Promise<Doc | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(docs).where(eq(docs.checksum, checksum)).limit(1);
  return result[0];
}

export async function updateDocAccess(docId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(docs)
    .set({
      accessCount: sql`${docs.accessCount} + 1`,
      lastAccessedAt: new Date(),
    })
    .where(eq(docs.id, docId));
}

export async function getDocsByModel(modelId: number): Promise<Doc[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(docs).where(eq(docs.modelId, modelId));
}

export async function getPopularDocs(limit: number = 10): Promise<Doc[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(docs).orderBy(sql`${docs.accessCount} DESC`).limit(limit);
}

// ============= AI Invocations Log =============

export async function logAiInvocation(invocation: typeof aiInvocations.$inferInsert) {
  const db = await getDb();
  if (!db) return;

  await db.insert(aiInvocations).values(invocation);
}

