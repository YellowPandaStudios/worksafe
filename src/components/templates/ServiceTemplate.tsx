'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, Clock, Users, Award, DollarSign } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BlockRenderer } from '@/components/blocks';
import type { ContentBlock } from '@/types/blocks';

interface SidebarItem {
  icon?: string;
  title: string;
  description?: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface ServiceTemplateProps {
  service: {
    title: string;
    heroTitle?: string | null;
    heroSubtitle?: string | null;
    heroImage?: string | null;
    heroImageAlt?: string | null;
    shortDescription: string;
    sidebarType: string;
    sidebarItems: SidebarItem[];
    price?: string | null;
    duration?: string | null;
    participants?: string | null;
    certification?: string | null;
    contentBlocks: ContentBlock[];
    ctaTitle?: string | null;
    ctaText?: string | null;
    ctaButtonText?: string | null;
    ctaLink?: string | null;
    faqItems: FaqItem[];
  };
}

const SIDEBAR_TYPE_TITLES: Record<string, string> = {
  benefits: 'Fördelar',
  includes: 'Vad ingår',
  specs: 'Specifikationer',
};

function getIconComponent(iconName?: string): React.ComponentType<{ className?: string }> {
  if (!iconName) return Check;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[iconName] as React.ComponentType<{ className?: string }> | undefined;
  return Icon || Check;
}

export function ServiceTemplate({ service }: ServiceTemplateProps): React.ReactElement {
  const {
    title,
    heroTitle,
    heroSubtitle,
    heroImage,
    heroImageAlt,
    shortDescription,
    sidebarType,
    sidebarItems,
    price,
    duration,
    participants,
    certification,
    contentBlocks,
    ctaTitle,
    ctaText,
    ctaButtonText,
    ctaLink,
    faqItems,
  } = service;

  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 to-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
                {heroTitle || title}
              </h1>
              {heroSubtitle && (
                <p className="mt-4 text-xl text-muted-foreground">
                  {heroSubtitle}
                </p>
              )}
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                {shortDescription}
              </p>
              {ctaLink && (
                <Button asChild size="lg" className="mt-8">
                  <Link href={ctaLink}>{ctaButtonText || 'Kontakta oss'}</Link>
                </Button>
              )}
            </div>
            {heroImage && (
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl">
                <Image
                  src={heroImage}
                  alt={heroImageAlt || title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Sidebar */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-24 space-y-6">
                {/* Sidebar Items */}
                {sidebarItems.length > 0 && (
                  <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">
                      {SIDEBAR_TYPE_TITLES[sidebarType] || 'Information'}
                    </h3>
                    <ul className="space-y-3">
                      {sidebarItems.map((item, index) => {
                        const Icon = getIconComponent(item.icon);
                        return (
                          <li key={index} className="flex gap-3">
                            <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <span className="font-medium text-foreground">{item.title}</span>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Price/Duration/etc */}
                {(price || duration || participants || certification) && (
                  <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Detaljer</h3>
                    <ul className="space-y-3">
                      {price && (
                        <li className="flex items-center gap-3">
                          <DollarSign className="h-5 w-5 text-primary" />
                          <span>{price}</span>
                        </li>
                      )}
                      {duration && (
                        <li className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary" />
                          <span>{duration}</span>
                        </li>
                      )}
                      {participants && (
                        <li className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-primary" />
                          <span>{participants}</span>
                        </li>
                      )}
                      {certification && (
                        <li className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-primary" />
                          <span>{certification}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* CTA Box */}
                {ctaLink && (
                  <div className="bg-primary text-primary-foreground rounded-xl p-6">
                    <h3 className="text-lg font-semibold">
                      {ctaTitle || 'Intresserad?'}
                    </h3>
                    {ctaText && (
                      <p className="mt-2 text-primary-foreground/90">
                        {ctaText}
                      </p>
                    )}
                    <Button asChild variant="secondary" className="mt-4 w-full">
                      <Link href={ctaLink}>{ctaButtonText || 'Kontakta oss'}</Link>
                    </Button>
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              {contentBlocks.length > 0 && (
                <div className="prose prose-lg max-w-none">
                  <BlockRenderer blocks={contentBlocks} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {faqItems.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-heading font-bold text-center mb-12">
              Vanliga frågor
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqItems.map((item, index) => (
                <details
                  key={index}
                  className="group bg-card border rounded-lg overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer font-medium hover:bg-muted/50 transition-colors">
                    {item.question}
                    <span className="ml-4 shrink-0 text-muted-foreground group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className="p-4 pt-0 text-muted-foreground">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
