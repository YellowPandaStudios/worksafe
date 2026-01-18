import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth-server';
import { isAdmin, isSuperAdmin } from '@/lib/roles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader, PageContainer } from '@/components/admin/common';
import { UserProfileTab } from './UserProfileTab';
import { UserAddressesTab } from './UserAddressesTab';
import { UserOrdersTab } from './UserOrdersTab';
import { UserSecurityTab } from './UserSecurityTab';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps): Promise<React.ReactElement> {
  const { id } = await params;

  // Get current user for permission checks
  const currentUser = await getServerUser();
  if (!currentUser || !isAdmin(currentUser.role)) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: {
        orderBy: { createdAt: 'desc' },
      },
      orders: {
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              name: true,
              quantity: true,
              totalPrice: true,
            },
          },
        },
      },
      twoFactor: {
        select: {
          id: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Check permissions
  const isOwnProfile = user.id === currentUser.id;
  const canEditUser = isSuperAdmin(currentUser.role) || 
    (isAdmin(currentUser.role) && user.role !== 'super_admin');
  const canChangeRole = isSuperAdmin(currentUser.role);
  const canResetTwoFactor = isAdmin(currentUser.role) && !isOwnProfile;

  // Serialize data for client components
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    role: user.role,
    customerType: user.customerType,
    company: user.company,
    orgNumber: user.orgNumber,
    vatNumber: user.vatNumber,
    phone: user.phone,
    defaultBillingAddressId: user.defaultBillingAddressId,
    defaultShippingAddressId: user.defaultShippingAddressId,
    acceptsMarketing: user.acceptsMarketing,
    marketingConsentAt: user.marketingConsentAt?.toISOString() || null,
    totalOrders: user.totalOrders,
    totalSpent: Number(user.totalSpent),
    lastOrderAt: user.lastOrderAt?.toISOString() || null,
    fortnoxCustomerId: user.fortnoxCustomerId,
    twoFactorEnabled: user.twoFactorEnabled,
    twoFactorGraceExpiresAt: user.twoFactorGraceExpiresAt?.toISOString() || null,
    twoFactorSetupAt: user.twoFactor?.createdAt?.toISOString() || null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  const addressesData = user.addresses.map((addr) => ({
    id: addr.id,
    type: addr.type,
    isDefault: addr.isDefault,
    name: addr.name,
    company: addr.company,
    street: addr.street,
    street2: addr.street2,
    city: addr.city,
    postalCode: addr.postalCode,
    country: addr.country,
    phone: addr.phone,
    createdAt: addr.createdAt.toISOString(),
  }));

  const ordersData = user.orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    total: Number(order.total),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    itemCount: order.items.length,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      totalPrice: Number(item.totalPrice),
    })),
  }));

  return (
    <PageContainer>
      <PageHeader
        title={user.name}
        description={user.email}
        backLink={{ href: '/admin/users', label: 'Tillbaka' }}
      />
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="addresses">Adresser</TabsTrigger>
          <TabsTrigger value="orders">Ordrar ({user._count.orders})</TabsTrigger>
          <TabsTrigger value="security">Säkerhet</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <UserProfileTab 
            user={userData} 
            canEdit={canEditUser}
            canChangeRole={canChangeRole}
          />
        </TabsContent>

        <TabsContent value="addresses">
          <UserAddressesTab 
            userId={user.id}
            addresses={addressesData}
            defaultBillingId={user.defaultBillingAddressId}
            defaultShippingId={user.defaultShippingAddressId}
          />
        </TabsContent>

        <TabsContent value="orders">
          <UserOrdersTab 
            orders={ordersData}
            totalOrders={user._count.orders}
            totalSpent={Number(user.totalSpent)}
          />
        </TabsContent>

        <TabsContent value="security">
          <UserSecurityTab 
            user={userData}
            canResetTwoFactor={canResetTwoFactor}
            isOwnProfile={isOwnProfile}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
