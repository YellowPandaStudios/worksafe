import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { requireAdmin } from '@/lib/auth-server';
import {
  getUploadUrl,
  getPublicUrl,
  sanitizeFilename,
  isAllowedImageType,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
} from '@/lib/r2';

const UploadRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string(),
  size: z.number().positive(),
  folder: z.string().default('uploads'),
});

/**
 * POST /api/upload
 * Get a presigned URL for uploading a file to R2
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Require admin authentication
    await requireAdmin();

    // Parse and validate request body
    const body = await request.json();
    const result = UploadRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { filename, contentType, size, folder } = result.data;

    // Validate file type
    if (!isAllowedImageType(contentType)) {
      return NextResponse.json(
        {
          error: 'File type not allowed',
          allowedTypes: ALLOWED_IMAGE_TYPES,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          maxSize: MAX_FILE_SIZE,
        },
        { status: 400 }
      );
    }

    // Generate unique key
    const sanitized = sanitizeFilename(filename);
    const uniqueId = nanoid(12);
    const key = `${folder}/${uniqueId}-${sanitized}`;

    // Get presigned upload URL
    const uploadUrl = await getUploadUrl(key, contentType);
    const publicUrl = getPublicUrl(key);

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl,
    });
  } catch (error) {
    console.error('Upload URL error:', error);

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
