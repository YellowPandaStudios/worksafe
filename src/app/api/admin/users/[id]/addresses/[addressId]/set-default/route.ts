import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';
import { z } from 'zod';

const setDefaultSchema = z.object({
  type: z.enum(['billing', 'shipping']),
});

interface RouteParams {
  params: Promise<{ id: string; addressId: string }>;
}

/**
 * POST /api/admin/users/[id]/addresses/[addressId]/set-default - Set address as default
 */
export async function POST(
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
    const validation = setDefaultSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Ogiltiga data', errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { type } = validation.data;

    // Update user with new default address
    const updateData = type === 'billing' 
      ? { defaultBillingAddressId: addressId }
      : { defaultShippingAddressId: addressId };

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ 
      message: `Adressen är nu standard ${type === 'billing' ? 'fakturerings' : 'leverans'}adress` 
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Forbidden') ? 403 : message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}
