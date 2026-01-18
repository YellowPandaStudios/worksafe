import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { formTemplateSchema } from '@/schemas/form-template';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/form-templates/[id]
 * Get a single form template
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;

  // Verify admin access
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const template = await prisma.formTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to fetch form template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/form-templates/[id]
 * Update a form template
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;

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

    // Check if template exists
    const existing = await prisma.formTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check if slug is taken by another template
    if (data.slug !== existing.slug) {
      const slugTaken = await prisma.formTemplate.findUnique({
        where: { slug: data.slug },
      });

      if (slugTaken) {
        return NextResponse.json(
          { error: 'En mall med denna slug finns redan' },
          { status: 400 }
        );
      }
    }

    const template = await prisma.formTemplate.update({
      where: { id },
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

    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to update form template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/form-templates/[id]
 * Delete a form template
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;

  // Verify admin access
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if template exists
    const existing = await prisma.formTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    await prisma.formTemplate.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete form template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
