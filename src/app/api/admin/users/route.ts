import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, getServerUser } from '@/lib/auth-server';
import { isSuperAdmin } from '@/lib/roles';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['super_admin', 'admin', 'editor', 'author', 'customer']),
  customerType: z.enum(['private', 'business']),
  company: z.string().optional(),
  phone: z.string().optional(),
  orgNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  sendWelcomeEmail: z.boolean().optional(),
  requireEmailVerification: z.boolean().optional(),
});

/**
 * GET /api/admin/users - List users with pagination, search, and filters
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const customerType = searchParams.get('customerType') || '';
    const twoFactorStatus = searchParams.get('twoFactorStatus') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortDir = searchParams.get('sortDir') || 'desc';

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'all') {
      where.role = role as Prisma.UserWhereInput['role'];
    }

    if (customerType && customerType !== 'all') {
      where.customerType = customerType as Prisma.UserWhereInput['customerType'];
    }

    if (twoFactorStatus && twoFactorStatus !== 'all') {
      where.twoFactorEnabled = twoFactorStatus === 'enabled';
    }

    // Count total
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customerType: true,
        twoFactorEnabled: true,
        totalOrders: true,
        totalSpent: true,
        lastOrderAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Forbidden') ? 403 : message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}

/**
 * POST /api/admin/users - Create a new user
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const currentUser = await getServerUser();
    if (!currentUser || !isSuperAdmin(currentUser.role)) {
      return NextResponse.json(
        { message: 'Endast super admin kan skapa användare' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Ogiltiga data', errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'E-postadressen används redan' },
        { status: 400 }
      );
    }

    // Hash password using Better Auth's internal method
    const { auth } = await import('@/lib/auth');
    const ctx = await auth.$context;
    const hashedPassword = await ctx.password.hash(data.password);

    // Set grace period for 2FA (30 days from now)
    const graceExpiresAt = new Date();
    graceExpiresAt.setDate(graceExpiresAt.getDate() + 30);

    // Create user and account in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create the user
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          emailVerified: !data.requireEmailVerification,
          role: data.role,
          customerType: data.customerType,
          company: data.company || null,
          phone: data.phone || null,
          orgNumber: data.orgNumber || null,
          vatNumber: data.vatNumber || null,
          twoFactorGraceExpiresAt: graceExpiresAt,
        },
      });

      // Create the account with password
      await tx.account.create({
        data: {
          userId: newUser.id,
          accountId: newUser.id,
          providerId: 'credential',
          password: hashedPassword,
        },
      });

      return newUser;
    });

    // TODO: Send welcome email if sendWelcomeEmail is true

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
