import { z } from 'zod';

const CampaignGoalSchema = z.enum(['lead_gen', 'awareness', 'product_sale', 'event_signup']);
const ContentStatusSchema = z.enum(['draft', 'published', 'archived']);

export const campaignSchema = z.object({
  name: z.string().min(1, 'Namn krävs'),
  slug: z.string().min(1, 'Slug krävs').regex(/^[a-z0-9-]+$/, 'Slug kan endast innehålla små bokstäver, siffror och bindestreck'),
  goal: CampaignGoalSchema,
  blocks: z.array(z.any()),
  formPosition: z.enum(['hero', 'sticky', 'bottom', 'inline']).default('hero'),
  hideNav: z.boolean().default(false),
  hideFooter: z.boolean().default(false),
  urgencyText: z.string().optional().nullable(),
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  redirectTo: z.string().optional().nullable(),
  trafficPercent: z.number().int().min(0).max(100).default(100),
  isTestActive: z.boolean().default(false),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  ogImage: z.string().url().optional().nullable(),
  // Advanced SEO & Indexing
  noIndex: z.boolean().default(true),
  noFollow: z.boolean().default(false),
  excludeFromSitemap: z.boolean().default(true),
  // Featured/Pinned
  isFeatured: z.boolean().default(false),
  // Access Control
  passwordProtected: z.boolean().default(false),
  password: z.string().optional().nullable(),
  // Redirect handling (redirectTo above is for after campaign ends)
  redirectOnDelete: z.string().optional().nullable(),
  // Localization
  locale: z.string().optional().nullable(),
  translationGroupId: z.string().optional().nullable(),
  // Publishing
  status: ContentStatusSchema.default('draft'),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;
