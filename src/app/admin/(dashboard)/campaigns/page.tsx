import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { PageHeader, PageContainer } from '@/components/admin/common';
import { CampaignsList } from './CampaignsList';

interface CampaignsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CampaignsPage({ searchParams }: CampaignsPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const search = (params.search as string) || '';
  const goal = (params.goal as string) || '';
  const status = (params.status as string) || '';
  const sortBy = (params.sortBy as string) || null;
  const sortDir = (params.sortDir as 'asc' | 'desc') || null;

  // Build where clause
  const where: Prisma.CampaignWhereInput = {};

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  if (goal && goal !== 'all') {
    where.goal = goal as Prisma.CampaignWhereInput['goal'];
  }

  if (status && status !== 'all') {
    where.status = status as Prisma.CampaignWhereInput['status'];
  }

  // Build orderBy clause
  const orderBy =
    sortBy && sortDir
      ? { [sortBy]: sortDir }
      : { createdAt: 'desc' as const };

  const campaigns = await prisma.campaign.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy,
    select: {
      id: true,
      name: true,
      slug: true,
      goal: true,
      status: true,
      startDate: true,
      endDate: true,
      updatedAt: true,
    },
  });

  return (
    <PageContainer>
      <PageHeader
        title="Kampanjer"
        actions={
          <Button asChild>
            <Link href="/admin/campaigns/new">
              <Plus className="h-4 w-4 mr-2" />
              Ny kampanj
            </Link>
          </Button>
        }
      />
      <CampaignsList campaigns={campaigns} />
    </PageContainer>
  );
}
