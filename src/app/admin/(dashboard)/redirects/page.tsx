import { ArrowRightLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { PageHeader, PageContainer, EmptyState } from '@/components/admin/common';
import { RedirectsList, type RedirectRow } from './RedirectsList';

interface RedirectsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RedirectsPage({ searchParams }: RedirectsPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const search = (params.search as string) || '';
  const type = (params.type as string) || '';
  const sortBy = (params.sortBy as string) || null;
  const sortDir = (params.sortDir as 'asc' | 'desc') || null;

  // Build orderBy clause
  const orderBy =
    sortBy && sortDir
      ? { [sortBy]: sortDir }
      : { hitCount: 'desc' as const };

  const rawRedirects = await prisma.redirect.findMany({
    where: search
      ? {
          OR: [
            { from: { contains: search, mode: 'insensitive' } },
            { to: { contains: search, mode: 'insensitive' } },
          ],
        }
      : type && type !== 'all'
        ? { type: type as 'permanent' | 'temporary' }
        : undefined,
    orderBy,
    select: {
      id: true,
      from: true,
      to: true,
      type: true,
      hitCount: true,
      lastHitAt: true,
      note: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const redirects: RedirectRow[] = rawRedirects.map((r) => ({
    id: r.id,
    from: r.from,
    to: r.to,
    type: r.type,
    hitCount: r.hitCount,
    lastHitAt: r.lastHitAt,
    note: r.note,
    createdAt: r.createdAt,
  }));

  return (
    <PageContainer>
      <PageHeader
        title="Redirects"
        description="Hantera URL-omdirigeringar"
      />
      {redirects.length === 0 && !search && !type ? (
        <EmptyState
          icon={<ArrowRightLeft className="h-12 w-12" />}
          title="Inga redirects ännu"
          description="Lägg till omdirigeringar för att hantera gamla URL:er."
        />
      ) : (
        <RedirectsList redirects={redirects} />
      )}
    </PageContainer>
  );
}
