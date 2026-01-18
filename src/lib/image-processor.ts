import sharp from 'sharp';

/**
 * Image variant configuration
 */
export const IMAGE_VARIANTS = {
  thumb: { width: 200, height: 200, fit: 'cover' as const },
  small: { width: 400, height: null, fit: 'inside' as const },
  medium: { width: 800, height: null, fit: 'inside' as const },
  large: { width: 1600, height: null, fit: 'inside' as const },
} as const;

export type VariantName = keyof typeof IMAGE_VARIANTS;

export interface ProcessedVariant {
  name: VariantName;
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
}

export interface ImageVariants {
  thumb: string;
  small: string;
  medium: string;
  large: string;
}

/**
 * Check if a MIME type can be processed by sharp
 */
export function isProcessableImage(mimeType: string): boolean {
  const processable = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/tiff',
  ];
  return processable.includes(mimeType);
}

/**
 * Process an image and generate all variants
 * @param imageBuffer - The original image buffer
 * @param originalWidth - Original image width (to avoid upscaling)
 * @returns Array of processed variants
 */
export async function generateVariants(
  imageBuffer: Buffer,
  originalWidth?: number
): Promise<ProcessedVariant[]> {
  const variants: ProcessedVariant[] = [];

  for (const [name, config] of Object.entries(IMAGE_VARIANTS)) {
    // Skip if original is smaller than target (don't upscale)
    if (originalWidth && config.width > originalWidth && name !== 'thumb') {
      continue;
    }

    try {
      let pipeline = sharp(imageBuffer);

      if (config.fit === 'cover') {
        // For thumbnails, crop to exact dimensions
        pipeline = pipeline.resize(config.width, config.height, {
          fit: 'cover',
          position: 'center',
        });
      } else {
        // For other sizes, maintain aspect ratio
        pipeline = pipeline.resize(config.width, config.height ?? undefined, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convert to WebP with good quality
      const buffer = await pipeline
        .webp({ quality: 82, effort: 4 })
        .toBuffer();

      // Get metadata of processed image
      const metadata = await sharp(buffer).metadata();

      variants.push({
        name: name as VariantName,
        buffer,
        width: metadata.width ?? config.width,
        height: metadata.height ?? config.height ?? 0,
        size: buffer.length,
      });
    } catch (error) {
      console.error(`Failed to generate ${name} variant:`, error);
      // Continue with other variants
    }
  }

  return variants;
}

/**
 * Maximum dimension for stored original images
 */
const MAX_ORIGINAL_SIZE = 2400;

/**
 * Compress and resize original image for storage
 * - Resizes to max 2400px on longest side (if larger)
 * - Converts to WebP with quality 80
 * - Maintains aspect ratio
 * 
 * @param imageBuffer - The original image buffer
 * @returns Compressed WebP buffer and metadata
 */
export async function compressOriginal(imageBuffer: Buffer): Promise<{
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
}> {
  // Get original dimensions
  const originalMetadata = await sharp(imageBuffer).metadata();
  const originalWidth = originalMetadata.width ?? 0;
  const originalHeight = originalMetadata.height ?? 0;

  // Determine if resize is needed
  const needsResize = originalWidth > MAX_ORIGINAL_SIZE || originalHeight > MAX_ORIGINAL_SIZE;

  let pipeline = sharp(imageBuffer);

  if (needsResize) {
    // Resize to fit within MAX_ORIGINAL_SIZE, maintaining aspect ratio
    pipeline = pipeline.resize(MAX_ORIGINAL_SIZE, MAX_ORIGINAL_SIZE, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert to WebP with quality 80 (good balance of quality and size)
  const webpBuffer = await pipeline
    .webp({ quality: 80, effort: 4 })
    .toBuffer();

  const metadata = await sharp(webpBuffer).metadata();

  return {
    buffer: webpBuffer,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    size: webpBuffer.length,
  };
}

/**
 * Convert original image to WebP format (no resizing)
 * @deprecated Use compressOriginal instead for better storage efficiency
 * @param imageBuffer - The original image buffer
 * @returns WebP buffer and metadata
 */
export async function convertToWebP(imageBuffer: Buffer): Promise<{
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
}> {
  const webpBuffer = await sharp(imageBuffer)
    .webp({ quality: 85, effort: 4 })
    .toBuffer();

  const metadata = await sharp(webpBuffer).metadata();

  return {
    buffer: webpBuffer,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    size: webpBuffer.length,
  };
}

/**
 * Get WebP key from original key (replaces extension with .webp)
 * @param originalKey - The original file key (e.g., "uploads/abc123-file.jpg")
 * @returns The WebP key (e.g., "uploads/abc123-file.webp")
 */
export function getWebPKey(originalKey: string): string {
  const lastDot = originalKey.lastIndexOf('.');
  const basePath = lastDot > 0 ? originalKey.slice(0, lastDot) : originalKey;
  return `${basePath}.webp`;
}

/**
 * Get the variant key for R2 storage
 * @param originalKey - The original file key (e.g., "uploads/abc123-file.jpg")
 * @param variantName - The variant name (e.g., "thumb")
 * @returns The variant key (e.g., "uploads/abc123-file/thumb.webp")
 */
export function getVariantKey(originalKey: string, variantName: VariantName): string {
  // Remove extension from original key
  const lastDot = originalKey.lastIndexOf('.');
  const basePath = lastDot > 0 ? originalKey.slice(0, lastDot) : originalKey;
  
  return `${basePath}/${variantName}.webp`;
}
