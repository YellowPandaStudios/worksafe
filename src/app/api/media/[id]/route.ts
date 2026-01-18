import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { deleteFile, extractKeyFromUrl } from '@/lib/r2';
import { getVariantKey, IMAGE_VARIANTS } from '@/lib/image-processor';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/media/[id]
 * Get a single media item
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    await requireAdmin();

    const { id } = await params;

    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
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

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    return NextResponse.json({ data: media });
  } catch (error) {
    console.error('Get media error:', error);

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

/**
 * PATCH /api/media/[id]
 * Update media metadata (alt text, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = ['alt', 'caption', 'folder', 'categoryId'];
    const updateData: Record<string, string | null> = {};

    for (const field of allowedFields) {
      if (field in body) {
        // Allow null for categoryId to uncategorize
        if (field === 'categoryId' && body[field] === null) {
          updateData[field] = null;
        } else if (body[field] !== undefined && body[field] !== null) {
          updateData[field] = body[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const media = await prisma.media.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: media });
  } catch (error) {
    console.error('Update media error:', error);

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

/**
 * DELETE /api/media/[id]
 * Delete media from R2 and database
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    await requireAdmin();

    const { id } = await params;

    // Get the media record first
    const media = await prisma.media.findUnique({
      where: { id },
      select: { id: true, url: true, filename: true, folder: true, variants: true },
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Try to delete from R2
    try {
      // Get the base key from URL
      let key = extractKeyFromUrl(media.url);
      if (!key) {
        // Fallback: construct key from folder and filename
        key = `${media.folder}/${media.filename}`;
      }

      // Delete original file
      await deleteFile(key);

      // Delete variant files if they exist
      if (media.variants && typeof media.variants === 'object') {
        const variants = media.variants as Record<string, string>;
        const variantNames = Object.keys(IMAGE_VARIANTS) as Array<keyof typeof IMAGE_VARIANTS>;
        
        for (const variantName of variantNames) {
          try {
            const variantKey = getVariantKey(key, variantName);
            await deleteFile(variantKey);
          } catch (variantError) {
            // Log but continue - variant might not exist
            console.error(`Failed to delete ${variantName} variant:`, variantError);
          }
        }
      }
    } catch (r2Error) {
      // Log but don't fail if R2 delete fails
      // The file might already be deleted or the URL format might be different
      console.error('R2 delete error (continuing with database delete):', r2Error);
    }

    // Delete from database
    await prisma.media.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Delete media error:', error);

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
