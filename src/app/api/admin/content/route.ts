import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export type ContentType = 'pages' | 'services' | 'products' | 'posts' | 'campaigns';

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  url: string;
  type: ContentType;
}

/**
 * GET /api/admin/content
 * Search for content across all types
 * Query params:
 *   - type: ContentType | 'all' (default: 'all')
 *   - search: string (optional)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verify admin access
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = (searchParams.get('type') || 'all') as ContentType | 'all';
  const search = searchParams.get('search') || '';

  const results: ContentItem[] = [];

  // Helper to create search condition
  const searchCondition = search
    ? { contains: search, mode: 'insensitive' as const }
    : undefined;

  // Query based on type
  if (type === 'all' || type === 'pages') {
    const pages = await prisma.page.findMany({
      where: search ? { title: searchCondition } : undefined,
      select: { id: true, title: true, slug: true, status: true },
      orderBy: { title: 'asc' },
      take: 20,
    });

    results.push(
      ...pages.map((page) => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
        status: page.status,
        url: `/${page.slug}`,
        type: 'pages' as const,
      }))
    );
  }

  if (type === 'all' || type === 'services') {
    const services = await prisma.service.findMany({
      where: search ? { title: searchCondition } : undefined,
      select: { id: true, title: true, slug: true, status: true },
      orderBy: { title: 'asc' },
      take: 20,
    });

    results.push(
      ...services.map((service) => ({
        id: service.id,
        title: service.title,
        slug: service.slug,
        status: service.status,
        url: `/tjanster/${service.slug}`,
        type: 'services' as const,
      }))
    );
  }

  if (type === 'all' || type === 'products') {
    const products = await prisma.product.findMany({
      where: search ? { name: searchCondition } : undefined,
      select: { id: true, name: true, slug: true, status: true },
      orderBy: { name: 'asc' },
      take: 20,
    });

    results.push(
      ...products.map((product) => ({
        id: product.id,
        title: product.name,
        slug: product.slug,
        status: product.status,
        url: `/butik/${product.slug}`,
        type: 'products' as const,
      }))
    );
  }

  if (type === 'all' || type === 'posts') {
    const posts = await prisma.post.findMany({
      where: search ? { title: searchCondition } : undefined,
      select: { id: true, title: true, slug: true, status: true },
      orderBy: { title: 'asc' },
      take: 20,
    });

    results.push(
      ...posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        url: `/blogg/${post.slug}`,
        type: 'posts' as const,
      }))
    );
  }

  if (type === 'all' || type === 'campaigns') {
    const campaigns = await prisma.campaign.findMany({
      where: search ? { name: searchCondition } : undefined,
      select: { id: true, name: true, slug: true, status: true },
      orderBy: { name: 'asc' },
      take: 20,
    });

    results.push(
      ...campaigns.map((campaign) => ({
        id: campaign.id,
        title: campaign.name,
        slug: campaign.slug,
        status: campaign.status,
        url: `/kampanj/${campaign.slug}`,
        type: 'campaigns' as const,
      }))
    );
  }

  // Sort by title when showing all types
  if (type === 'all') {
    results.sort((a, b) => a.title.localeCompare(b.title, 'sv'));
  }

  return NextResponse.json(results);
}
