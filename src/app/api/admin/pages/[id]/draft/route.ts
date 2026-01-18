import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Schema for draft auto-save (all fields optional except blocks)
const draftSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  blocks: z.array(z.any()).optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  pageType: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  ogImage: z.string().url().nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  noIndex: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  publishedAt: z.string().datetime().nullable().optional(),
});

/**
 * PATCH /api/admin/pages/[id]/draft
 * Auto-save draft (partial update, only for draft status pages)
 */
export async function PATCH(
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
    // Check if page exists and is a draft
    const existingPage = await prisma.page.findUnique({
      where: { id },
    });

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Sidan hittades inte' },
        { status: 404 }
      );
    }

    if (existingPage.status !== 'draft') {
      return NextResponse.json(
        { error: 'Kan endast auto-spara utkast' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = draftSchema.safeParse(body);

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

    // Build update data (only include provided fields)
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.blocks !== undefined) updateData.blocks = data.blocks;
    if (data.parentId !== undefined) updateData.parentId = data.parentId;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.pageType !== undefined) updateData.pageType = data.pageType;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
    if (data.ogImage !== undefined) updateData.ogImage = data.ogImage;
    if (data.canonicalUrl !== undefined) updateData.canonicalUrl = data.canonicalUrl;
    if (data.noIndex !== undefined) updateData.noIndex = data.noIndex;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
    }

    // Update page
    await prisma.page.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to auto-save draft:', error);
    return NextResponse.json(
      { error: 'Kunde inte auto-spara utkast' },
      { status: 500 }
    );
  }
}
