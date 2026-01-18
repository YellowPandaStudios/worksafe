import { z } from 'zod';

const ContentStatusSchema = z.enum(['draft', 'published', 'archived']);

export const postSchema = z.object({
  title: z.string().min(1, 'Titel krävs'),
  slug: z.string().min(1, 'Slug krävs').regex(/^[a-z0-9-]+$/, 'Slug kan endast innehålla små bokstäver, siffror och bindestreck'),
  excerpt: z.string().optional().nullable(),
  featuredImage: z.string().url().optional().nullable(),
  featuredImageAlt: z.string().optional().nullable(),
  contentBlocks: z.array(z.any()),
  showToc: z.boolean().default(true),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()),
  relatedServiceId: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  ogImage: z.string().url().optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
  // Advanced SEO & Indexing
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
  excludeFromSitemap: z.boolean().default(false),
  // Featured/Pinned
  isFeatured: z.boolean().default(false),
  // Access Control
  passwordProtected: z.boolean().default(false),
  password: z.string().optional().nullable(),
  // Redirect handling
  redirectOnDelete: z.string().optional().nullable(),
  // Localization
  locale: z.string().optional().nullable(),
  translationGroupId: z.string().optional().nullable(),
  // Publishing
  status: ContentStatusSchema.default('draft'),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledFor: z.string().datetime().optional().nullable(),
  authorId: z.string().optional().nullable(),
});

export type PostFormData = z.infer<typeof postSchema>;
