import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';
import { z } from 'zod';

const addressSchema = z.object({
  type: z.enum(['billing', 'shipping', 'both']),
  name: z.string().min(1),
  company: z.string().optional(),
  street: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/users/[id]/addresses - Get user's addresses
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    await requireAdmin();
    const { id } = await params;

    const addresses = await prisma.userAddress.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Forbidden') ? 403 : message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}

/**
 * POST /api/admin/users/[id]/addresses - Create a new address for user
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Användare hittades inte' }, { status: 404 });
    }

    const body = await request.json();
    const validation = addressSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Ogiltiga data', errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const address = await prisma.userAddress.create({
      data: {
        userId: id,
        type: data.type,
        name: data.name,
        company: data.company || null,
        street: data.street,
        street2: data.street2 || null,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone || null,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Forbidden') ? 403 : message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}
