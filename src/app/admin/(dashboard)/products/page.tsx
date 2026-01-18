import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { PageHeader, PageContainer } from '@/components/admin/common';
import { ProductsList, type ProductRow } from './ProductsList';

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const search = (params.search as string) || '';
  const category = (params.category as string) || '';
  const status = (params.status as string) || '';
  const sortBy = (params.sortBy as string) || null;
  const sortDir = (params.sortDir as 'asc' | 'desc') || null;

  // Build where clause
  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  if (category && category !== 'all') {
    where.category = category as Prisma.ProductWhereInput['category'];
  }

  if (status && status !== 'all') {
    where.status = status as Prisma.ProductWhereInput['status'];
  }

  // Build orderBy clause
  const orderBy =
    sortBy && sortDir
      ? { [sortBy]: sortDir }
      : { sortOrder: 'asc' as const };

  const rawProducts = await prisma.product.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy,
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      category: true,
      price: true,
      status: true,
      updatedAt: true,
    },
  });

  // Convert Decimal to number and map category to categoryId for ProductRow
  const products: ProductRow[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    categoryId: p.category, // Map old enum category to categoryId for display
    price: p.price ? Number(p.price) : null,
    status: p.status,
    updatedAt: p.updatedAt,
  }));

  return (
    <PageContainer>
      <PageHeader
        title="Produkter"
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Ny produkt
            </Link>
          </Button>
        }
      />
      <ProductsList products={products} />
    </PageContainer>
  );
}
