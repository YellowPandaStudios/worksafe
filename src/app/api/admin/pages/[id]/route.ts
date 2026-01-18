import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { pageSchema } from '@/schemas/page';
import {
  generatePagePath,
  updateDescendantPaths,
  validateParentId,
} from '@/lib/page-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/admin/pages/[id]
 * Update an existing page
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  // Verify admin access
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { id },
    });

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Sidan hittades inte' },
        { status: 404 }
      );
    }

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

    // Check if slug is being changed and if new slug already exists
    if (data.slug !== existingPage.slug) {
      const slugConflict = await prisma.page.findUnique({
        where: { slug: data.slug },
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: 'En sida med denna slug finns redan' },
          { status: 400 }
        );
      }
    }

    // Validate parentId if provided and changed
    if (data.parentId !== existingPage.parentId) {
      if (data.parentId) {
        const isValid = await validateParentId(id, data.parentId);
        if (!isValid) {
          return NextResponse.json(
            { error: 'Ogiltig föräldersida (skapar cirkulär referens)' },
            { status: 400 }
          );
        }
      }
    }

    // Update page
    const page = await prisma.page.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        blocks: data.blocks,
        parentId: data.parentId ?? null,
        sortOrder: data.sortOrder ?? existingPage.sortOrder,
        pageType: data.pageType ?? null,
        categoryId: data.categoryId ?? null,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        ogImage: data.ogImage ?? null,
        canonicalUrl: data.canonicalUrl ?? null,
        noIndex: data.noIndex ?? false,
        status: data.status ?? existingPage.status,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      },
    });

    // Regenerate path if slug or parent changed
    let finalPath = page.path;
    if (data.slug !== existingPage.slug || data.parentId !== existingPage.parentId) {
      const path = await generatePagePath({
        slug: page.slug,
        parentId: page.parentId,
      });
      const updatedPage = await prisma.page.update({
        where: { id: page.id },
        data: { path },
      });
      finalPath = updatedPage.path;

      // Update all descendant paths
      await updateDescendantPaths(page.id);
    }

    // Fetch the final page to get the path
    const finalPage = await prisma.page.findUnique({
      where: { id: page.id },
      select: { path: true },
    });

    return NextResponse.json({
      success: true,
      id: page.id,
      path: finalPage?.path || finalPath,
    });
  } catch (error) {
    console.error('Failed to update page:', error);
    return NextResponse.json(
      { error: 'Kunde inte uppdatera sidan' },
      { status: 500 }
    );
  }
}
