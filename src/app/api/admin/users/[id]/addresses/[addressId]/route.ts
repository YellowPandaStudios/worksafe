import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';
import { z } from 'zod';

const updateAddressSchema = z.object({
  type: z.enum(['billing', 'shipping', 'both']).optional(),
  name: z.string().min(1).optional(),
  company: z.string().optional().nullable(),
  street: z.string().min(1).optional(),
  street2: z.string().optional().nullable(),
  city: z.string().min(1).optional(),
  postalCode: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string; addressId: string }>;
}

/**
 * PATCH /api/admin/users/[id]/addresses/[addressId] - Update an address
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    await requireAdmin();
    const { id, addressId } = await params;

    // Check if address belongs to user
    const address = await prisma.userAddress.findFirst({
      where: { id: addressId, userId: id },
    });

    if (!address) {
      return NextResponse.json({ message: 'Adressen hittades inte' }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateAddressSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Ogiltiga data', errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const updatedAddress = await prisma.userAddress.update({
      where: { id: addressId },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.name && { name: data.name }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.street && { street: data.street }),
        ...(data.street2 !== undefined && { street2: data.street2 }),
        ...(data.city && { city: data.city }),
        ...(data.postalCode && { postalCode: data.postalCode }),
        ...(data.country && { country: data.country }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Forbidden') ? 403 : message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}

/**
 * DELETE /api/admin/users/[id]/addresses/[addressId] - Delete an address
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    await requireAdmin();
    const { id, addressId } = await params;

    // Check if address belongs to user
    const address = await prisma.userAddress.findFirst({
      where: { id: addressId, userId: id },
    });

    if (!address) {
      return NextResponse.json({ message: 'Adressen hittades inte' }, { status: 404 });
    }

    await prisma.userAddress.delete({
      where: { id: addressId },
    });

    return NextResponse.json({ message: 'Adressen har tagits bort' });
  } catch (error) {
    console.error('Error deleting address:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Forbidden') ? 403 : message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}
