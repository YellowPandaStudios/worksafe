import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { downloadFile, uploadBuffer, deleteFile, getPublicUrl } from '@/lib/r2';
import {
  generateVariants,
  getVariantKey,
  getWebPKey,
  compressOriginal,
  isProcessableImage,
  type ImageVariants,
} from '@/lib/image-processor';

const ConfirmUploadSchema = z.object({
  key: z.string().min(1),
  url: z.string().url(),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().positive(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  folder: z.string().default('uploads'),
  alt: z.string().optional(),
  categoryId: z.string().optional().nullable(),
});

/**
 * POST /api/upload/confirm
 * Confirm upload, generate variants, and create Media record in database
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Require admin authentication
    const user = await requireAdmin();

    // Parse and validate request body
    const body = await request.json();
    const result = ConfirmUploadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let { key, url, filename, mimeType, size, width, height, folder, alt, categoryId } = result.data;

    // Extract just the filename from the key (remove folder prefix and unique ID)
    const keyParts = key.split('/');
    const filenamePart = keyParts[keyParts.length - 1];

    // Convert original to WebP and generate variants for processable images
    let variants: ImageVariants | null = null;
    let finalUrl = url;
    let finalMimeType = mimeType;
    let finalSize = size;
    let finalWidth = width;
    let finalHeight = height;

    if (isProcessableImage(mimeType)) {
      try {
        console.log('Downloading original image for processing...');
        const originalBuffer = await downloadFile(key);

        // Compress and resize original (max 2400px, quality 80, WebP)
        console.log('Compressing original to WebP (max 2400px)...');
        const webpResult = await compressOriginal(originalBuffer);
        
        // Get WebP key (replace extension with .webp)
        const webpKey = getWebPKey(key);
        
        // Upload WebP version (replacing original)
        console.log('Uploading WebP version...');
        const webpUrl = await uploadBuffer(
          webpKey,
          webpResult.buffer,
          'image/webp'
        );

        // Delete original file if it's different from WebP key
        if (key !== webpKey) {
          try {
            await deleteFile(key);
            console.log('Deleted original file');
          } catch (deleteError) {
            console.error('Failed to delete original file:', deleteError);
            // Continue anyway
          }
        }

        // Update values to use WebP version
        key = webpKey;
        finalUrl = webpUrl;
        finalMimeType = 'image/webp';
        finalSize = webpResult.size;
        finalWidth = webpResult.width;
        finalHeight = webpResult.height;

        // Generate variants from WebP version
        console.log('Generating image variants...');
        const processedVariants = await generateVariants(webpResult.buffer, webpResult.width);

        // Upload each variant to R2
        const variantUrls: Partial<ImageVariants> = {};

        for (const variant of processedVariants) {
          const variantKey = getVariantKey(key, variant.name);
          console.log(`Uploading ${variant.name} variant (${variant.width}x${variant.height})...`);

          const variantUrl = await uploadBuffer(
            variantKey,
            variant.buffer,
            'image/webp'
          );

          variantUrls[variant.name] = variantUrl;
        }

        // Only set variants if we have at least a thumbnail
        if (variantUrls.thumb) {
          variants = variantUrls as ImageVariants;
        }

        console.log('Processing complete:', Object.keys(variantUrls));
      } catch (processingError) {
        // Log but don't fail - original image still uploaded
        console.error('Image processing failed:', processingError);
      }
    }

    // Update filename to reflect WebP extension if converted
    const finalFilename = finalMimeType === 'image/webp' && !filenamePart.endsWith('.webp')
      ? filenamePart.replace(/\.[^.]+$/, '.webp')
      : filenamePart;

    // Update originalName to reflect WebP extension if converted
    const finalOriginalName = finalMimeType === 'image/webp' && !filename.endsWith('.webp')
      ? filename.replace(/\.[^.]+$/, '.webp')
      : filename;

    // Create Media record
    const media = await prisma.media.create({
      data: {
        url: finalUrl,
        filename: finalFilename,
        originalName: finalOriginalName,
        mimeType: finalMimeType,
        size: finalSize,
        width: finalWidth ?? null,
        height: finalHeight ?? null,
        folder,
        alt: alt ?? null,
        categoryId: categoryId ?? null,
        variants: variants ? (variants as unknown as Record<string, string>) : undefined,
        uploadedById: user.id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, media },
      { status: 201 }
    );
  } catch (error) {
    console.error('Confirm upload error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
