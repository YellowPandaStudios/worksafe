import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Namn krävs'),
  slug: z.string().min(1, 'Slug krävs').regex(/^[a-z0-9-]+$/, 'Slug får endast innehålla små bokstäver, siffror och bindestreck'),
  description: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  type: z.enum(['main', 'section', 'sub_category']).default('main'),
  heroImage: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  ogImage: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
