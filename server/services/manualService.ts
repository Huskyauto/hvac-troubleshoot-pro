import * as db from "../db";
import { storagePut } from "../storage";
import crypto from "crypto";

export interface ManualUploadResult {
  docId: number;
  url: string;
  cached: boolean;
}

/**
 * Save or retrieve a manual for a specific equipment model
 * If the manual already exists (by URL checksum), return the cached version
 * Otherwise, download and store it
 */
export async function saveManual(params: {
  url: string;
  title: string;
  source: "user_manual" | "service_manual" | "installation_manual" | "parts_list";
  modelId?: number;
  brand?: string;
  equipmentTypes?: string[];
  userId: string;
}): Promise<ManualUploadResult> {
  const { url, title, source, modelId, brand, equipmentTypes, userId } = params;

  // Generate checksum from URL to detect duplicates
  const checksum = crypto.createHash("sha256").update(url).digest("hex").substring(0, 40);

  // Check if we already have this manual
  const existing = await db.getDocByChecksum(checksum);
  if (existing) {
    // Update access tracking
    await db.updateDocAccess(existing.id);
    return {
      docId: existing.id,
      url: existing.blobUrl || existing.url || "",
      cached: true,
    };
  }

  // Download the manual (in a real implementation, you'd fetch the file)
  // For now, we'll just store the URL reference
  let blobUrl = url;
  let fileSize = 0;

  // If it's a PDF or downloadable file, we could download and store it
  // const response = await fetch(url);
  // const buffer = await response.arrayBuffer();
  // fileSize = buffer.byteLength;
  // const uploadResult = await storagePut(
  //   `manuals/${checksum}.pdf`,
  //   Buffer.from(buffer),
  //   "application/pdf"
  // );
  // blobUrl = uploadResult.url;

  // Create the document record
  const result = await db.createDoc({
    source,
    title,
    url,
    equipmentTypes,
    brand,
    modelId,
    checksum,
    blobUrl,
    fileSize,
    accessCount: 1,
    lastAccessedAt: new Date(),
    uploadedBy: userId,
  });

  const docId = Number(result[0].insertId);

  return {
    docId,
    url: blobUrl,
    cached: false,
  };
}

/**
 * Track manual access and update statistics
 */
export async function trackManualAccess(docId: number): Promise<void> {
  await db.updateDocAccess(docId);
}

/**
 * Get all manuals for a specific equipment model
 */
export async function getManualsForModel(modelId: number) {
  return await db.getDocsByModel(modelId);
}

/**
 * Search manuals by brand and equipment type
 */
export async function searchManuals(params: {
  brand?: string;
  equipmentType?: string;
  query?: string;
}) {
  return await db.searchDocuments(params.query || "", params.brand, params.equipmentType);
}

/**
 * Get most frequently accessed manuals
 */
export async function getPopularManuals(limit: number = 10) {
  return await db.getPopularDocs(limit);
}

/**
 * Upload a manual file from user
 */
export async function uploadManualFile(params: {
  file: Buffer;
  filename: string;
  contentType: string;
  title: string;
  source: string;
  modelId?: number;
  brand?: string;
  equipmentTypes?: string[];
  userId: string;
}): Promise<ManualUploadResult> {
  const { file, filename, contentType, title, source, modelId, brand, equipmentTypes, userId } = params;

  // Generate checksum from file content
  const checksum = crypto.createHash("sha256").update(file).digest("hex").substring(0, 40);

  // Check if we already have this file
  const existing = await db.getDocByChecksum(checksum);
  if (existing) {
    await db.updateDocAccess(existing.id);
    return {
      docId: existing.id,
      url: existing.blobUrl || "",
      cached: true,
    };
  }

  // Upload to S3
  const uploadResult = await storagePut(
    `manuals/${checksum}-${filename}`,
    file,
    contentType
  );

  // Create document record
  const result = await db.createDoc({
    source,
    title,
    url: uploadResult.url,
    equipmentTypes,
    brand,
    modelId,
    checksum,
    blobUrl: uploadResult.url,
    fileSize: file.length,
    accessCount: 1,
    lastAccessedAt: new Date(),
    uploadedBy: userId,
  });

  const docId = Number(result[0].insertId);

  return {
    docId,
    url: uploadResult.url,
    cached: false,
  };
}

