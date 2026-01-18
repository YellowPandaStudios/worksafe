import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth-server';
import { isAdmin } from '@/lib/roles';
import { resetTwoFactor } from '@/lib/two-factor';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/users/[id]/reset-2fa - Reset a user's 2FA
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const currentUser = await getServerUser();
    if (!currentUser || !isAdmin(currentUser.role)) {
      return NextResponse.json({ message: 'Åtkomst nekad' }, { status: 403 });
    }

    const { id } = await params;

    // Prevent resetting your own 2FA through this endpoint
    if (id === currentUser.id) {
      return NextResponse.json(
        { message: 'Du kan inte återställa din egen 2FA via admin' },
        { status: 400 }
      );
    }

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        twoFactorEnabled: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ message: 'Användare hittades inte' }, { status: 404 });
    }

    // Check if 2FA is even enabled
    if (!targetUser.twoFactorEnabled) {
      return NextResponse.json(
        { message: 'Användaren har inte 2FA aktiverat' },
        { status: 400 }
      );
    }

    // Reset the 2FA
    await resetTwoFactor(id);

    return NextResponse.json({
      message: `Tvåfaktorsautentisering har återställts för ${targetUser.name}`,
    });
  } catch (error) {
    console.error('Error resetting 2FA:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Forbidden') ? 403 : message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}
