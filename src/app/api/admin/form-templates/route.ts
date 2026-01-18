import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { formTemplateSchema } from '@/schemas/form-template';

/**
 * GET /api/admin/form-templates
 * List all form templates
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verify admin access
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('active') === 'true';

  try {
    const templates = await prisma.formTemplate.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        preset: true,
        fields: true,
        categoryMode: true,
        categoryLabel: true,
        customCategories: true,
        submitButtonText: true,
        successMessage: true,
        defaultTitle: true,
        defaultSubtitle: true,
        usageCount: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to fetch form templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/form-templates
 * Create a new form template
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
    const result = formTemplateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check if slug already exists
    const existing = await prisma.formTemplate.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'En mall med denna slug finns redan' },
        { status: 400 }
      );
    }

    const template = await prisma.formTemplate.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        preset: data.preset,
        fields: data.fields,
        categoryMode: data.categoryMode,
        categoryLabel: data.categoryLabel,
        customCategories: data.customCategories,
        submitButtonText: data.submitButtonText,
        successMessage: data.successMessage,
        defaultTitle: data.defaultTitle,
        defaultSubtitle: data.defaultSubtitle,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Failed to create form template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
