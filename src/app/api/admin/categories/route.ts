import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { categorySchema } from '@/schemas/category';
import { slugify } from '@/lib/slugify';

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
 * Update paths for all children when a category's path changes
 */
async function updateChildrenPaths(categoryId: string, newPath: string): Promise<void> {
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
    // Recursively update grandchildren
    await updateChildrenPaths(child.id, childPath);
  }

  // Also update service paths under this category
  await prisma.service.updateMany({
    where: { categoryId },
    data: {}, // Trigger will need to recompute - we'll handle this separately
  });
}

/**
 * GET /api/admin/categories
 * List all categories with hierarchy
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format'); // 'flat' or 'tree'
  const includeInactive = searchParams.get('includeInactive') === 'true';

  const whereClause = includeInactive ? {} : { isActive: true };

  if (format === 'flat') {
    // Flat list with depth indication (for select dropdowns)
    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: [{ path: 'asc' }, { sortOrder: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        path: true,
        type: true,
        parentId: true,
        isActive: true,
        _count: {
          select: { services: true, children: true },
        },
      },
    });

    // Add depth based on path segments
    const flatList = categories.map((cat) => ({
      ...cat,
      depth: cat.path.split('/').filter(Boolean).length - 1,
      serviceCount: cat._count.services,
      childCount: cat._count.children,
    }));

    return NextResponse.json(flatList);
  }

  // Tree format (default)
  const categories = await prisma.category.findMany({
    where: { ...whereClause, parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        where: whereClause,
        orderBy: { sortOrder: 'asc' },
        include: {
          children: {
            where: whereClause,
            orderBy: { sortOrder: 'asc' },
            include: {
              children: {
                where: whereClause,
                orderBy: { sortOrder: 'asc' },
              },
              _count: { select: { services: true } },
            },
          },
          _count: { select: { services: true } },
        },
      },
      _count: { select: { services: true } },
    },
  });

  return NextResponse.json(categories);
}

/**
 * POST /api/admin/categories
 * Create a new category
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
    const validated = categorySchema.parse(body);

    // Auto-generate slug if not provided
    const slug = validated.slug || slugify(validated.name);

    // Check for duplicate slug
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'En kategori med denna slug finns redan' },
        { status: 400 }
      );
    }

    // Compute path based on parent
    const path = await computeCategoryPath(slug, validated.parentId || null);

    // Check for duplicate path
    const existingPath = await prisma.category.findUnique({
      where: { path },
    });

    if (existingPath) {
      return NextResponse.json(
        { error: 'En kategori med denna sökväg finns redan' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: validated.name,
        slug,
        description: validated.description || null,
        parentId: validated.parentId || null,
        path,
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

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Failed to create category:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Valideringsfel', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Kunde inte skapa kategorin' },
      { status: 500 }
    );
  }
}
