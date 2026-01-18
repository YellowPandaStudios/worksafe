import { z } from 'zod';

const ContentStatusSchema = z.enum(['draft', 'published', 'archived']);

// Legacy feature schema (deprecated, use sidebarItems)
const FeatureSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

// Sidebar item schema
const SidebarItemSchema = z.object({
  id: z.string().optional(),
  icon: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
});

// FAQ item schema
const FaqItemSchema = z.object({
  id: z.string().optional(),
  question: z.string(),
  answer: z.string(),
});

export const serviceSchema = z.object({
  title: z.string().min(1, 'Titel krävs'),
  slug: z.string().min(1, 'Slug krävs').regex(/^[a-z0-9-]+$/, 'Slug kan endast innehålla små bokstäver, siffror och bindestreck'),
  
  // Category and URL structure
  categoryId: z.string().nullable().optional(),
  subcategory: z.string().nullable().optional(),
  
  // Hero section
  heroTitle: z.string().optional().nullable(),
  heroSubtitle: z.string().optional().nullable(),
  heroImage: z.string().url().optional().nullable(),
  heroImageAlt: z.string().optional().nullable(),
  
  // Hero action buttons
  heroButtonsEnabled: z.boolean().default(false),
  heroPrimaryButtonText: z.string().optional().nullable(),
  heroPrimaryButtonLink: z.string().optional().nullable(),
  heroSecondaryButtonText: z.string().optional().nullable(),
  heroSecondaryButtonLink: z.string().optional().nullable(),
  
  // Short description
  shortDescription: z.string().min(1, 'Kort beskrivning krävs'),
  
  // Sidebar info
  sidebarType: z.enum(['benefits', 'includes', 'specs']).default('benefits'),
  sidebarItems: z.array(SidebarItemSchema).default([]),
  
  // Pricing/details
  price: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  participants: z.string().optional().nullable(),
  certification: z.string().optional().nullable(),
  
  // Main content (simplified blocks)
  contentBlocks: z.array(z.any()),
  
  // Legacy features (deprecated)
  features: z.array(FeatureSchema).default([]),
  
  // CTA section
  ctaTitle: z.string().optional().nullable(),
  ctaText: z.string().optional().nullable(),
  ctaLink: z.string().optional().nullable(),
  ctaButtonText: z.string().optional().nullable(),
  hubspotFormId: z.string().optional().nullable(),
  
  // FAQ
  faqItems: z.array(FaqItemSchema).default([]),
  
  // Related services
  relatedServiceIds: z.array(z.string()).default([]),
  
  // SEO
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
  sortOrder: z.number().int().default(0),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
export type SidebarItem = z.infer<typeof SidebarItemSchema>;
export type FaqItem = z.infer<typeof FaqItemSchema>;