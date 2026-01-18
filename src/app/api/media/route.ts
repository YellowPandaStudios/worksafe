import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/media
 * List media with search, filtering, and pagination
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Require admin authentication
    await requireAdmin();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '24', 10)));
    const search = searchParams.get('search') || '';
    const folder = searchParams.get('folder') || '';
    const mimeType = searchParams.get('mimeType') || '';
    const categoryId = searchParams.get('categoryId') || '';

    // Build where clause
    const where: {
      folder?: string;
      mimeType?: { startsWith: string };
      categoryId?: string | null;
      OR?: Array<{
        filename?: { contains: string; mode: 'insensitive' };
        alt?: { contains: string; mode: 'insensitive' };
        originalName?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};

    if (folder) {
      where.folder = folder;
    }

    if (mimeType) {
      where.mimeType = { startsWith: mimeType };
    }

    if (categoryId) {
      // Allow "none" to filter for uncategorized
      where.categoryId = categoryId === 'none' ? null : categoryId;
    }

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.media.count({ where });

    // Get paginated results
    const media = await prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        url: true,
        cdnUrl: true,
        filename: true,
        originalName: true,
        alt: true,
        mimeType: true,
        size: true,
        width: true,
        height: true,
        folder: true,
        variants: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        createdAt: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      data: media,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('List media error:', error);

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
