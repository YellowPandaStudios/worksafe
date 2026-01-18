import { z } from 'zod';

const ContentStatusSchema = z.enum(['draft', 'published', 'archived']);

export const pageSchema = z.object({
  title: z.string().min(1, 'Titel krävs'),
  slug: z.string().regex(/^[a-z0-9-]*$/, 'Slug kan endast innehålla små bokstäver, siffror och bindestreck'),
  blocks: z.array(z.any()),
  // Hierarchy fields
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  // Page type
  pageType: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
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
}).refine(
  (data) => {
    // Slug is required unless pageType is 'home'
    if (data.pageType === 'home') {
      return true;
    }
    return data.slug.length > 0;
  },
  {
    message: 'Slug krävs',
    path: ['slug'],
  }
);

export type PageFormData = z.infer<typeof pageSchema>;
