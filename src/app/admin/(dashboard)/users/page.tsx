import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { PageHeader, PageContainer } from '@/components/admin/common';
import { UsersList, type UserRow } from './UsersList';

interface UsersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const search = (params.search as string) || '';
  const role = (params.role as string) || '';
  const customerType = (params.customerType as string) || '';
  const twoFactorStatus = (params.twoFactorStatus as string) || '';
  const sortBy = (params.sortBy as string) || null;
  const sortDir = (params.sortDir as 'asc' | 'desc') || null;

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

  // Build orderBy clause
  const orderBy =
    sortBy && sortDir
      ? { [sortBy]: sortDir }
      : { createdAt: 'desc' as const };

  const rawUsers = await prisma.user.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy,
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

  // Convert Decimal to number for display
  const users: UserRow[] = rawUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    customerType: u.customerType,
    twoFactorEnabled: u.twoFactorEnabled,
    totalOrders: u.totalOrders,
    totalSpent: Number(u.totalSpent),
    lastOrderAt: u.lastOrderAt,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));

  return (
    <PageContainer>
      <PageHeader
        title="Användare"
        actions={
          <Button asChild>
            <Link href="/admin/users/new">
              <Plus className="h-4 w-4 mr-2" />
              Ny användare
            </Link>
          </Button>
        }
      />
      <UsersList users={users} />
    </PageContainer>
  );
}
