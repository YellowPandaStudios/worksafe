import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, getServerUser } from '@/lib/auth-server';
import { isAdmin, isSuperAdmin } from '@/lib/roles';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['super_admin', 'admin', 'editor', 'author', 'customer']).optional(),
  customerType: z.enum(['private', 'business']).optional(),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  orgNumber: z.string().optional().nullable(),
  vatNumber: z.string().optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/users/[id] - Get a single user
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customerType: true,
        company: true,
        phone: true,
        orgNumber: true,
        vatNumber: true,
        twoFactorEnabled: true,
        twoFactorGraceExpiresAt: true,
        totalOrders: true,
        totalSpent: true,
        lastOrderAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Användare hittades inte' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Forbidden') ? 403 : message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}

/**
 * PATCH /api/admin/users/[id] - Update a user
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const currentUser = await getServerUser();
    if (!currentUser || !isAdmin(currentUser.role)) {
      return NextResponse.json({ message: 'Åtkomst nekad' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Ogiltiga data', errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ message: 'Användare hittades inte' }, { status: 404 });
    }

    // Permission checks
    // Only super_admin can edit other super_admins
    if (targetUser.role === 'super_admin' && !isSuperAdmin(currentUser.role)) {
      return NextResponse.json(
        { message: 'Endast super admin kan redigera andra super admins' },
        { status: 403 }
      );
    }

    // Only super_admin can change roles
    if (data.role && !isSuperAdmin(currentUser.role)) {
      return NextResponse.json(
        { message: 'Endast super admin kan ändra roller' },
        { status: 403 }
      );
    }

    // Prevent demoting yourself from super_admin
    if (
      data.role &&
      id === currentUser.id &&
      currentUser.role === 'super_admin' &&
      data.role !== 'super_admin'
    ) {
      return NextResponse.json(
        { message: 'Du kan inte ta bort din egen super admin roll' },
        { status: 400 }
      );
    }

    // Check for email uniqueness if email is being changed
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== id) {
        return NextResponse.json(
          { message: 'E-postadressen används redan' },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.role && { role: data.role }),
        ...(data.customerType && { customerType: data.customerType }),
        ...(data.company !== undefined && { company: data.company || null }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.orgNumber !== undefined && { orgNumber: data.orgNumber || null }),
        ...(data.vatNumber !== undefined && { vatNumber: data.vatNumber || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customerType: true,
        company: true,
        phone: true,
        orgNumber: true,
        vatNumber: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Forbidden') ? 403 : message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}

/**
 * DELETE /api/admin/users/[id] - Delete a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const currentUser = await getServerUser();
    if (!currentUser || !isSuperAdmin(currentUser.role)) {
      return NextResponse.json(
        { message: 'Endast super admin kan ta bort användare' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent deleting yourself
    if (id === currentUser.id) {
      return NextResponse.json(
        { message: 'Du kan inte ta bort ditt eget konto' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Användare hittades inte' }, { status: 404 });
    }

    // Prevent deleting other super_admins (safety measure)
    if (user.role === 'super_admin') {
      return NextResponse.json(
        { message: 'Super admin konton kan inte tas bort via API' },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Användare borttagen' });
  } catch (error) {
    console.error('Error deleting user:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Forbidden') ? 403 : message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}
