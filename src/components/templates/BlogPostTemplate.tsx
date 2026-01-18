'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BlockRenderer } from '@/components/blocks';
import type { ContentBlock } from '@/types/blocks';

interface BlogPostTemplateProps {
  post: {
    title: string;
    slug: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    featuredImageAlt?: string | null;
    contentBlocks: ContentBlock[];
    showToc: boolean;
    publishedAt?: string | null;
    readingTime?: number | null;
    author?: {
      name: string;
      image?: string | null;
    } | null;
    category?: {
      name: string;
      slug: string;
    } | null;
  };
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function BlogPostTemplate({ post }: BlogPostTemplateProps): React.ReactElement {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  const {
    title,
    slug,
    excerpt,
    featuredImage,
    featuredImageAlt,
    contentBlocks,
    showToc,
    publishedAt,
    readingTime,
    author,
    category,
  } = post;

  // Generate TOC from content blocks (looking for headings in richText blocks)
  useEffect(() => {
    if (!showToc) return;

    const items: TocItem[] = [];
    contentBlocks.forEach((block, blockIndex) => {
      if (block.type === 'richText' && block.content) {
        // Parse TipTap JSON to find headings
        const content = block.content as { content?: Array<{ type: string; attrs?: { level?: number }; content?: Array<{ text?: string }> }> };
        content.content?.forEach((node, nodeIndex) => {
          if (node.type === 'heading' && node.attrs?.level && node.attrs.level <= 3) {
            const text = node.content?.map((c) => c.text || '').join('') || '';
            const id = `heading-${blockIndex}-${nodeIndex}`;
            items.push({
              id,
              text,
              level: node.attrs.level,
            });
          }
        });
      }
    });
    setTocItems(items);
  }, [contentBlocks, showToc]);

  // Track active heading on scroll
  useEffect(() => {
    if (!showToc || tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tocItems, showToc]);

  return (
    <main>
      {/* Hero Section */}
      <article>
        <header className="relative">
          {featuredImage && (
            <div className="relative h-64 md:h-96 w-full">
              <Image
                src={featuredImage}
                alt={featuredImageAlt || title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
          )}
          
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto -mt-16 relative z-10">
              {/* Back link */}
              <Link
                href="/blogg"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Tillbaka till bloggen
              </Link>

              {/* Category */}
              {category && (
                <Link
                  href={`/blogg/kategori/${category.slug}`}
                  className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4"
                >
                  {category.name}
                </Link>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
                {title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-foreground">
                {author && (
                  <div className="flex items-center gap-2">
                    {author.image ? (
                      <Image
                        src={author.image}
                        alt={author.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span>{author.name}</span>
                  </div>
                )}
                {publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
                  </div>
                )}
                {readingTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{readingTime} min läsning</span>
                  </div>
                )}
              </div>

              {/* Excerpt */}
              {excerpt && (
                <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
                  {excerpt}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Content with optional TOC */}
        <div className="container mx-auto px-4 py-12">
          <div className={cn(
            'mx-auto',
            showToc && tocItems.length > 0 ? 'grid lg:grid-cols-4 gap-12' : 'max-w-3xl'
          )}>
            {/* TOC Sidebar */}
            {showToc && tocItems.length > 0 && (
              <aside className="hidden lg:block">
                <nav className="sticky top-24">
                  <h4 className="text-sm font-semibold text-foreground mb-4">
                    Innehåll
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {tocItems.map((item) => (
                      <li
                        key={item.id}
                        style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
                      >
                        <a
                          href={`#${item.id}`}
                          className={cn(
                            'block py-1 text-muted-foreground hover:text-foreground transition-colors',
                            activeId === item.id && 'text-primary font-medium'
                          )}
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}

            {/* Main Content */}
            <div className={cn(
              showToc && tocItems.length > 0 ? 'lg:col-span-3' : ''
            )}>
              <div className="prose prose-lg max-w-none">
                <BlockRenderer blocks={contentBlocks} />
              </div>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
