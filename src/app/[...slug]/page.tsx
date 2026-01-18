import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { BlockRenderer } from '@/components/blocks';
import { ContentBlock } from '@/types/blocks';

interface CatchAllPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

type ContentResult = {
  type: 'page' | 'category' | 'service';
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  noIndex?: boolean;
  blocks: ContentBlock[];
};

/**
 * Fetch content by path - checks pages, categories, and services
 */
async function getContent(slugParts: string[]): Promise<ContentResult | null> {
  const path = '/' + slugParts.join('/');

  // 1. First try to find a Page by path
  let page = await prisma.page.findFirst({
    where: {
      path,
      status: 'published',
    },
  });

  // Fall back to simple slug match for root-level pages
  if (!page && slugParts.length === 1) {
    page = await prisma.page.findFirst({
      where: {
        slug: slugParts[0],
        status: 'published',
        parentId: null,
      },
    });
  }

  if (page) {
    return {
      type: 'page',
      title: page.title,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      ogImage: page.ogImage,
      canonicalUrl: page.canonicalUrl,
      noIndex: page.noIndex,
      blocks: (page.blocks as unknown as ContentBlock[]) || [],
    };
  }

  // 2. Try to find a Category by path
  const category = await prisma.category.findFirst({
    where: {
      path,
      isActive: true,
    },
  });

  if (category) {
    return {
      type: 'category',
      title: category.name,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      ogImage: category.ogImage,
      canonicalUrl: null,
      blocks: (category.blocks as unknown as ContentBlock[]) || [],
    };
  }

  // 3. Try to find a Service by path
  const service = await prisma.service.findFirst({
    where: {
      path,
      status: 'published',
    },
  });

  if (service) {
    return {
      type: 'service',
      title: service.title,
      metaTitle: service.metaTitle,
      metaDescription: service.metaDescription,
      ogImage: service.ogImage,
      canonicalUrl: service.canonicalUrl,
      blocks: (service.contentBlocks as unknown as ContentBlock[]) || [],
    };
  }

  return null;
}

export async function generateMetadata({
  params,
}: CatchAllPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent(slug);

  if (!content) {
    return {
      title: 'Sidan hittades inte',
    };
  }

  return {
    title: content.metaTitle || content.title,
    description: content.metaDescription || undefined,
    openGraph: {
      title: content.metaTitle || content.title,
      description: content.metaDescription || undefined,
      images: content.ogImage ? [content.ogImage] : undefined,
    },
    alternates: {
      canonical: content.canonicalUrl || undefined,
    },
    robots: content.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { slug } = await params;
  const content = await getContent(slug);

  if (!content) {
    notFound();
  }

  return (
    <main>
      <BlockRenderer blocks={content.blocks} />
    </main>
  );
}

/**
 * Generate static params for all published content (pages, categories, services)
 */
export async function generateStaticParams() {
  // Get all published pages
  const pages = await prisma.page.findMany({
    where: { status: 'published' },
    select: { slug: true, path: true },
  });

  // Get all active categories
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { path: true },
  });

  // Get all published services with paths
  const services = await prisma.service.findMany({
    where: { status: 'published', path: { not: null } },
    select: { path: true },
  });

  const allPaths: { slug: string[] }[] = [];

  // Add page paths
  for (const page of pages) {
    const fullPath = page.path || `/${page.slug}`;
    const parts = fullPath.split('/').filter(Boolean);
    allPaths.push({ slug: parts });
  }

  // Add category paths
  for (const category of categories) {
    const parts = category.path.split('/').filter(Boolean);
    if (parts.length > 0) {
      allPaths.push({ slug: parts });
    }
  }

  // Add service paths
  for (const service of services) {
    if (service.path) {
      const parts = service.path.split('/').filter(Boolean);
      if (parts.length > 0) {
        allPaths.push({ slug: parts });
      }
    }
  }

  return allPaths;
}
