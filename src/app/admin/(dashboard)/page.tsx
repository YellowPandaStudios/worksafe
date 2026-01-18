import type { Metadata } from 'next';
import { Briefcase, Package, FileText, Inbox } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { PageHeader, PageContainer, StatCard, StatCardGrid } from '@/components/admin/common';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function AdminDashboardPage(): Promise<React.ReactElement> {
  // Fetch real stats from database
  const [servicesCount, productsCount, postsCount, submissionsCount] = await Promise.all([
    prisma.service.count(),
    prisma.product.count(),
    prisma.post.count(),
    prisma.formSubmission.count(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Välkommen till Work Safe Admin Portal."
      />
      <StatCardGrid columns={4}>
        <StatCard
          label="Tjänster"
          value={servicesCount}
          icon={<Briefcase className="h-4 w-4" />}
        />
        <StatCard
          label="Produkter"
          value={productsCount}
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          label="Inlägg"
          value={postsCount}
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          label="Formulär"
          value={submissionsCount}
          icon={<Inbox className="h-4 w-4" />}
        />
      </StatCardGrid>
    </PageContainer>
  );
}
