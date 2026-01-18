import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Environment variable validation
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

/**
 * Allowed image MIME types for upload
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

/**
 * Maximum file size in bytes (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Presigned URL expiration time in seconds (1 hour)
 */
const PRESIGNED_URL_EXPIRES_IN = 3600;

/**
 * Get the R2 S3-compatible client
 */
export function getR2Client(): S3Client {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error('R2 credentials not configured');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Generate a presigned URL for uploading a file to R2
 */
export async function getUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  if (!R2_BUCKET) {
    throw new Error('R2_BUCKET not configured');
  }

  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(client, command, {
    expiresIn: PRESIGNED_URL_EXPIRES_IN,
  });

  return url;
}

/**
 * Delete a file from R2
 */
export async function deleteFile(key: string): Promise<void> {
  if (!R2_BUCKET) {
    throw new Error('R2_BUCKET not configured');
  }

  const client = getR2Client();

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });

  await client.send(command);
}

/**
 * Upload a buffer directly to R2 (for processed images)
 */
export async function uploadBuffer(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (!R2_BUCKET) {
    throw new Error('R2_BUCKET not configured');
  }

  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);

  return getPublicUrl(key);
}

/**
 * Download a file from R2 as buffer
 */
export async function downloadFile(key: string): Promise<Buffer> {
  if (!R2_BUCKET) {
    throw new Error('R2_BUCKET not configured');
  }

  const client = getR2Client();

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });

  const response = await client.send(command);

  if (!response.Body) {
    throw new Error('Empty response body');
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * Get the public URL for a file
 */
export function getPublicUrl(key: string): string {
  if (!R2_PUBLIC_URL) {
    throw new Error('R2_PUBLIC_URL not configured');
  }

  // Remove trailing slash from public URL if present
  const baseUrl = R2_PUBLIC_URL.replace(/\/$/, '');
  return `${baseUrl}/${key}`;
}

/**
 * Sanitize a filename for use as part of an S3 key
 * Removes special characters and replaces spaces with hyphens
 */
export function sanitizeFilename(filename: string): string {
  // Get the extension
  const lastDot = filename.lastIndexOf('.');
  const name = lastDot > 0 ? filename.slice(0, lastDot) : filename;
  const ext = lastDot > 0 ? filename.slice(lastDot) : '';

  // Sanitize the name part
  const sanitized = name
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50); // Limit length

  return sanitized + ext.toLowerCase();
}

/**
 * Check if a MIME type is allowed for upload
 */
export function isAllowedImageType(mimeType: string): mimeType is AllowedImageType {
  return ALLOWED_IMAGE_TYPES.includes(mimeType as AllowedImageType);
}

/**
 * Extract the key from a full R2 URL
 */
export function extractKeyFromUrl(url: string): string | null {
  if (!R2_PUBLIC_URL) {
    return null;
  }

  const baseUrl = R2_PUBLIC_URL.replace(/\/$/, '');
  if (url.startsWith(baseUrl)) {
    return url.slice(baseUrl.length + 1);
  }

  return null;
}
