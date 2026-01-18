import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/languages
 * Fetch all active languages for content localization
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';

    const languages = await prisma.language.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [
        { isDefault: 'desc' },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
      select: {
        code: true,
        name: true,
        nativeName: true,
        isDefault: true,
        isActive: true,
      },
    });

    return NextResponse.json(languages);
  } catch (error) {
    console.error('Failed to fetch languages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch languages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/languages
 * Create a new language
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const { code, name, nativeName, isDefault, isActive, sortOrder } = body;

    if (!code || !name || !nativeName) {
      return NextResponse.json(
        { error: 'Code, name, and nativeName are required' },
        { status: 400 }
      );
    }

    // If this is being set as default, unset other defaults
    if (isDefault) {
      await prisma.language.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const language = await prisma.language.create({
      data: {
        code: code.toLowerCase(),
        name,
        nativeName,
        isDefault: isDefault || false,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(language, { status: 201 });
  } catch (error) {
    console.error('Failed to create language:', error);
    return NextResponse.json(
      { error: 'Failed to create language' },
      { status: 500 }
    );
  }
}
