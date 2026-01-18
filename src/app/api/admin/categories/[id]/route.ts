import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { categorySchema } from '@/schemas/category';

interface RouteParams {
  params: Promise<{ id: string }>;
}

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
 * GET /api/admin/categories/[id]
 * Get a single category
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true, path: true } },
      children: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, slug: true, path: true },
      },
      services: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, title: true, slug: true, status: true },
      },
      _count: { select: { services: true, children: true } },
    },
  });

  if (!category) {
    return NextResponse.json({ error: 'Kategori hittades inte' }, { status: 404 });
  }

  return NextResponse.json(category);
}

/**
 * PUT /api/admin/categories/[id]
 * Update a category
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const validated = categorySchema.parse(body);

    // Get current category
    const existing = await prisma.category.findUnique({
      where: { id },
      select: { slug: true, path: true, parentId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Kategori hittades inte' }, { status: 404 });
    }

    // Check for circular reference (can't be its own parent or descendant's child)
    if (validated.parentId) {
      if (validated.parentId === id) {
        return NextResponse.json(
          { error: 'En kategori kan inte vara sin egen förälder' },
          { status: 400 }
        );
      }

      // Check if the new parent is a descendant of this category
      const isDescendant = async (parentId: string): Promise<boolean> => {
        const parent = await prisma.category.findUnique({
          where: { id: parentId },
          select: { parentId: true },
        });
        if (!parent) return false;
        if (parent.parentId === id) return true;
        if (parent.parentId) return isDescendant(parent.parentId);
        return false;
      };

      if (await isDescendant(validated.parentId)) {
        return NextResponse.json(
          { error: 'Kan inte flytta en kategori till en av dess underkategorier' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate slug (excluding current)
    const duplicateSlug = await prisma.category.findFirst({
      where: {
        slug: validated.slug,
        id: { not: id },
      },
    });

    if (duplicateSlug) {
      return NextResponse.json(
        { error: 'En annan kategori med denna slug finns redan' },
        { status: 400 }
      );
    }

    // Compute new path
    const newPath = await computeCategoryPath(validated.slug, validated.parentId || null);

    // Check for duplicate path (excluding current)
    const duplicatePath = await prisma.category.findFirst({
      where: {
        path: newPath,
        id: { not: id },
      },
    });

    if (duplicatePath) {
      return NextResponse.json(
        { error: 'En annan kategori med denna sökväg finns redan' },
        { status: 400 }
      );
    }

    // Update the category
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: validated.name,
        slug: validated.slug,
        description: validated.description || null,
        parentId: validated.parentId || null,
        path: newPath,
        type: validated.type,
        heroImage: validated.heroImage || null,
        metaTitle: validated.metaTitle || null,
        metaDescription: validated.metaDescription || null,
        ogImage: validated.ogImage || null,
        sortOrder: validated.sortOrder,
        isActive: validated.isActive,
      },
      include: {
        parent: { select: { id: true, name: true, path: true } },
        _count: { select: { services: true, children: true } },
      },
    });

    // If path changed, update all descendants
    if (existing.path !== newPath) {
      await updateDescendantPaths(id, newPath);
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Failed to update category:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Valideringsfel', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Kunde inte uppdatera kategorin' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete a category
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Check if category has children or services
  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      _count: { select: { children: true, services: true } },
    },
  });

  if (!category) {
    return NextResponse.json({ error: 'Kategori hittades inte' }, { status: 404 });
  }

  if (category._count.children > 0) {
    return NextResponse.json(
      { error: 'Kan inte ta bort en kategori som har underkategorier. Ta bort eller flytta underkategorierna först.' },
      { status: 400 }
    );
  }

  if (category._count.services > 0) {
    return NextResponse.json(
      { error: 'Kan inte ta bort en kategori som har tjänster. Flytta tjänsterna till en annan kategori först.' },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
