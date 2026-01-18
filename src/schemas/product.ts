import { z } from 'zod';

const ContentStatusSchema = z.enum(['draft', 'published', 'archived']);

const GalleryImageSchema = z.object({
  url: z.string().url(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const SpecificationSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Namn krävs'),
  slug: z.string().min(1, 'Slug krävs').regex(/^[a-z0-9-]+$/, 'Slug kan endast innehålla små bokstäver, siffror och bindestreck'),
  categoryId: z.string().nullable().optional(),
  sku: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  imageAlt: z.string().optional().nullable(),
  gallery: z.array(GalleryImageSchema),
  price: z.number().positive().optional().nullable(),
  comparePrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  vatRate: z.number().min(0).max(100).default(25),
  vatIncluded: z.boolean().default(true),
  b2bPrice: z.number().positive().optional().nullable(),
  b2bMinQuantity: z.number().int().positive().optional().nullable(),
  trackStock: z.boolean().default(true),
  stockQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  allowBackorder: z.boolean().default(false),
  backorderLeadDays: z.number().int().positive().optional().nullable(),
  minQuantity: z.number().int().positive().default(1),
  maxQuantity: z.number().int().positive().optional().nullable(),
  quantityStep: z.number().int().positive().default(1),
  shortDescription: z.string().min(1, 'Kort beskrivning krävs'),
  contentBlocks: z.array(z.any()),
  specifications: z.array(SpecificationSchema),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  ogImage: z.string().url().optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
  // Advanced SEO & Indexing
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
  excludeFromSitemap: z.boolean().default(false),
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
  sortOrder: z.number().int().default(0),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  newArrivalUntil: z.string().datetime().optional().nullable(),
});

export type ProductFormData = z.infer<typeof productSchema>;
