import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { PageHeader, PageContainer } from '@/components/admin/common';
import { CategoryTree } from '@/components/admin/CategoryTree';

export default async function CategoriesPage(): Promise<React.ReactElement> {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        orderBy: { sortOrder: 'asc' },
        include: {
          children: {
            orderBy: { sortOrder: 'asc' },
            include: {
              children: {
                orderBy: { sortOrder: 'asc' },
              },
              _count: { select: { services: true } },
            },
          },
          _count: { select: { services: true } },
        },
      },
      _count: { select: { services: true } },
    },
  });

  return (
    <PageContainer>
      <PageHeader
        title="Kategorier"
        description="Hantera kategorier för tjänster och innehåll. Kategorier bygger URL-strukturen."
        actions={
          <Button asChild>
            <Link href="/admin/categories/new">
              <Plus className="h-4 w-4 mr-2" />
              Ny kategori
            </Link>
          </Button>
        }
      />
      <CategoryTree categories={categories} />
    </PageContainer>
  );
}
