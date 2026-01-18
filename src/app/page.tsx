import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { BlockRenderer } from '@/components/blocks';
import { ContentBlock } from '@/types/blocks';

/**
 * Fetch the homepage (page with pageType 'home')
 */
async function getHomePage() {
  const page = await prisma.page.findFirst({
    where: {
      pageType: 'home',
      status: 'published',
    },
  });

  return page;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage();

  if (!page) {
    return {
      title: 'Work Safe i Sverige AB',
      description: 'Brandskydd, hjärtstartare, första hjälpen och säkerhetsutbildningar',
    };
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDescription || undefined,
      images: page.ogImage ? [page.ogImage] : undefined,
    },
    alternates: {
      canonical: page.canonicalUrl || undefined,
    },
    robots: page.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function HomePage() {
  const page = await getHomePage();

  if (!page) {
    // Show a placeholder when no homepage is configured
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center p-8">
          <h1 className="text-2xl font-heading font-bold mb-4">
            Startsida ej konfigurerad
          </h1>
          <p className="text-muted-foreground mb-6">
            Skapa en sida i admin med sidtyp &quot;Startsida&quot; för att visa innehåll här.
          </p>
          <a
            href="/admin/pages/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Skapa startsida
          </a>
        </div>
      </main>
    );
  }

  const blocks = (page.blocks as unknown as ContentBlock[]) || [];

  return (
    <main>
      <BlockRenderer blocks={blocks} />
    </main>
  );
}
