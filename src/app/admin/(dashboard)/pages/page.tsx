import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { PageHeader, PageContainer } from '@/components/admin/common';
import { PagesList, type PageRow } from './PagesList';

/**
 * Build a flat list with depth for tree display
 */
function buildPageTree(
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    path: string | null;
    parentId: string | null;
    sortOrder: number;
    pageType: string | null;
    status: string;
    updatedAt: Date;
  }>
): PageRow[] {
  const result: PageRow[] = [];

  function addWithChildren(parentId: string | null, depth: number) {
    const children = pages
      .filter((p) => p.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, 'sv'));

    for (const page of children) {
      result.push({
        id: page.id,
        title: page.title,
        slug: page.slug,
        path: page.path,
        pageType: page.pageType,
        status: page.status,
        updatedAt: page.updatedAt,
        depth,
      });
      addWithChildren(page.id, depth + 1);
    }
  }

  addWithChildren(null, 0);
  return result;
}

interface PagesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PagesPage({ searchParams }: PagesPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const search = (params.search as string) || '';
  const pageType = (params.pageType as string) || '';
  const status = (params.status as string) || '';
  const sortBy = (params.sortBy as string) || null;
  const sortDir = (params.sortDir as 'asc' | 'desc') || null;

  // Build where clause
  const where: Prisma.PageWhereInput = {};

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  if (pageType && pageType !== 'all') {
    where.pageType = pageType;
  }

  if (status && status !== 'all') {
    where.status = status as Prisma.PageWhereInput['status'];
  }

  // Fetch pages
  const pages = await prisma.page.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    select: {
      id: true,
      title: true,
      slug: true,
      path: true,
      parentId: true,
      sortOrder: true,
      pageType: true,
      status: true,
      updatedAt: true,
    },
  });

  // Build tree structure
  let treePages = buildPageTree(pages);

  // Apply sorting if specified (after tree is built)
  if (sortBy && sortDir) {
    treePages = [...treePages].sort((a, b) => {
      const aValue = a[sortBy as keyof PageRow];
      const bValue = b[sortBy as keyof PageRow];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDir === 'asc'
          ? aValue.localeCompare(bValue, 'sv')
          : bValue.localeCompare(aValue, 'sv');
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDir === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return 0;
    });
  }

  return (
    <PageContainer>
      <PageHeader
        title="Sidor"
        actions={
          <Button asChild>
            <Link href="/admin/pages/new">
              <Plus className="h-4 w-4 mr-2" />
              Ny sida
            </Link>
          </Button>
        }
      />
      <PagesList pages={treePages} />
    </PageContainer>
  );
}
