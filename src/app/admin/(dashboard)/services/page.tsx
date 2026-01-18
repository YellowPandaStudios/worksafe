import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { ListPageLayout } from '@/components/admin/layouts';
import { ServicesList, type ServiceRow } from './ServicesList';

interface ServicesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ServicesPage({ searchParams }: ServicesPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const search = (params.search as string) || '';
  const categoryId = (params.category as string) || '';
  const status = (params.status as string) || '';
  const sortBy = (params.sortBy as string) || null;
  const sortDir = (params.sortDir as 'asc' | 'desc') || null;

  // Build where clause
  const where: Prisma.ServiceWhereInput = {};

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  if (categoryId && categoryId !== 'all') {
    where.categoryId = categoryId;
  }

  if (status && status !== 'all') {
    where.status = status as Prisma.ServiceWhereInput['status'];
  }

  // Build orderBy clause
  const orderBy =
    sortBy && sortDir
      ? { [sortBy]: sortDir }
      : { sortOrder: 'asc' as const };

  const rawServices = await prisma.service.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy,
    select: {
      id: true,
      title: true,
      slug: true,
      categoryId: true,
      category: {
        select: { name: true },
      },
      status: true,
      updatedAt: true,
    },
  });

  // Map to ServiceRow format
  const services: ServiceRow[] = rawServices.map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    categoryId: s.categoryId,
    categoryName: s.category?.name || null,
    status: s.status,
    updatedAt: s.updatedAt,
  }));

  return (
    <ListPageLayout
      title="Tjänster"
      description="Hantera företagets tjänster och utbildningar"
      createHref="/admin/services/new"
      createLabel="Ny tjänst"
      isEmpty={services.length === 0}
      emptyState={{
        title: 'Inga tjänster än',
        description: 'Skapa din första tjänst för att komma igång.',
        createLabel: 'Skapa tjänst',
      }}
    >
      <ServicesList services={services} />
    </ListPageLayout>
  );
}
