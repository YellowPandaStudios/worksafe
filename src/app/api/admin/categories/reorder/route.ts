import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int(),
      parentId: z.string().nullable().optional(),
    })
  ),
});

/**
 * Compute the full path for a category based on its parent hierarchy
 */
async function computeCategoryPath(slug: string, parentId: string | null): Promise<string> {
  if (!parentId) {
    return `/${slug}`;
  }

  const parent = await prisma.category.findUnique({
    where: { id: parentId },
    select: { path: true },
  });

  if (!parent) {
    return `/${slug}`;
  }

  return `${parent.path}/${slug}`;
}

/**
 * Recursively update paths for all descendants
 */
async function updateDescendantPaths(categoryId: string, newPath: string): Promise<void> {
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true, slug: true },
  });

  for (const child of children) {
    const childPath = `${newPath}/${child.slug}`;
    await prisma.category.update({
      where: { id: child.id },
      data: { path: childPath },
    });
    await updateDescendantPaths(child.id, childPath);
  }

  // Update service paths under this category
  const services = await prisma.service.findMany({
    where: { categoryId },
    select: { id: true, slug: true },
  });

  for (const service of services) {
    await prisma.service.update({
      where: { id: service.id },
      data: { path: `${newPath}/${service.slug}` },
    });
  }
}

/**
 * POST /api/admin/categories/reorder
 * Reorder categories (drag and drop)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = reorderSchema.parse(body);

    // Process each item
    for (const item of validated.items) {
      const existing = await prisma.category.findUnique({
        where: { id: item.id },
        select: { slug: true, path: true, parentId: true },
      });

      if (!existing) continue;

      const parentChanged = item.parentId !== undefined && item.parentId !== existing.parentId;

      if (parentChanged) {
        // Compute new path
        const newPath = await computeCategoryPath(existing.slug, item.parentId || null);

        // Update category with new parent and path
        await prisma.category.update({
          where: { id: item.id },
          data: {
            sortOrder: item.sortOrder,
            parentId: item.parentId || null,
            path: newPath,
          },
        });

        // Update all descendant paths
        await updateDescendantPaths(item.id, newPath);
      } else {
        // Just update sort order
        await prisma.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder categories:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Valideringsfel', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Kunde inte ändra ordningen' },
      { status: 500 }
    );
  }
}
