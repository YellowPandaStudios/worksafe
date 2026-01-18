import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { pageSchema } from '@/schemas/page';
import {
  generatePagePath,
  getNextSortOrder,
  updateDescendantPaths,
  validateParentId,
} from '@/lib/page-utils';

/**
 * GET /api/admin/pages
 * List pages with optional filtering
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verify admin access
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get('pageType');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    const where: Record<string, unknown> = {};

    if (pageType) {
      where.pageType = pageType;
    }

    if (status) {
      where.status = status;
    }

    const pages = await prisma.page.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      take: limit ? parseInt(limit, 10) : undefined,
      select: {
        id: true,
        title: true,
        slug: true,
        path: true,
        pageType: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Failed to list pages:', error);
    return NextResponse.json(
      { error: 'Kunde inte hämta sidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pages
 * Create a new page
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Verify admin access
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = pageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug: data.slug },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: 'En sida med denna slug finns redan' },
        { status: 400 }
      );
    }

    // Validate parentId if provided
    if (data.parentId) {
      const isValid = await validateParentId('', data.parentId);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Ogiltig föräldersida' },
          { status: 400 }
        );
      }
    }

    // Get sort order if not provided
    const sortOrder = data.sortOrder ?? (await getNextSortOrder(data.parentId ?? null));

    // Create page
    const page = await prisma.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        blocks: data.blocks,
        parentId: data.parentId ?? null,
        sortOrder,
        pageType: data.pageType ?? null,
        categoryId: data.categoryId ?? null,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        ogImage: data.ogImage ?? null,
        canonicalUrl: data.canonicalUrl ?? null,
        noIndex: data.noIndex ?? false,
        status: data.status ?? 'draft',
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      },
    });

    // Generate and update path
    const path = await generatePagePath({
      slug: page.slug,
      parentId: page.parentId,
    });
    const updatedPage = await prisma.page.update({
      where: { id: page.id },
      data: { path },
    });

    // Update descendant paths if this page has children (shouldn't happen on create, but just in case)
    await updateDescendantPaths(page.id);

    return NextResponse.json(
      { success: true, id: page.id, path: updatedPage.path },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create page:', error);
    return NextResponse.json(
      { error: 'Kunde inte skapa sidan' },
      { status: 500 }
    );
  }
}
