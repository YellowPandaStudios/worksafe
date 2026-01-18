import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { PageHeader, PageContainer } from '@/components/admin/common';
import { PostsList } from './PostsList';

interface PostsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const search = (params.search as string) || '';
  const category = (params.category as string) || '';
  const status = (params.status as string) || '';
  const author = (params.author as string) || '';
  const sortBy = (params.sortBy as string) || null;
  const sortDir = (params.sortDir as 'asc' | 'desc') || null;

  // Build where clause
  const where: Prisma.PostWhereInput = {};

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  if (category && category !== 'all') {
    where.categoryId = category;
  }

  if (status && status !== 'all') {
    where.status = status as Prisma.PostWhereInput['status'];
  }

  if (author && author !== 'all') {
    where.authorId = author;
  }

  // Build orderBy clause
  const orderBy =
    sortBy && sortDir && sortBy !== 'category' && sortBy !== 'author'
      ? { [sortBy]: sortDir }
      : { createdAt: 'desc' as const };

  const [posts, categories, authors] = await Promise.all([
    prisma.post.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy,
      select: {
        id: true,
        title: true,
        slug: true,
        category: {
          select: {
            name: true,
          },
        },
        author: {
          select: {
            name: true,
          },
        },
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
    }),
    prisma.postCategory.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: {
        posts: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Inlägg"
        actions={
          <Button asChild>
            <Link href="/admin/posts/new">
              <Plus className="h-4 w-4 mr-2" />
              Nytt inlägg
            </Link>
          </Button>
        }
      />
      <PostsList posts={posts} categories={categories} authors={authors} />
    </PageContainer>
  );
}
