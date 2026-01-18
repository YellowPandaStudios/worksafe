import { z } from 'zod';

// Form types
export const FormTypeSchema = z.enum(['contact', 'quote', 'callback', 'newsletter']);
export type FormType = z.infer<typeof FormTypeSchema>;

// Service categories (matches Prisma enum)
export const ServiceCategorySchema = z.enum([
  'brandskydd',
  'utbildningar',
  'hjartstartare',
  'forsta_hjalpen',
]);
export type ServiceCategory = z.infer<typeof ServiceCategorySchema>;

// Display labels for service categories (Swedish)
export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  brandskydd: 'Brandskydd',
  utbildningar: 'Utbildningar',
  hjartstartare: 'Hjärtstartare',
  forsta_hjalpen: 'Första hjälpen',
};

// Form type labels (Swedish)
export const FORM_TYPE_LABELS: Record<FormType, string> = {
  contact: 'Kontakt',
  quote: 'Offertförfrågan',
  callback: 'Återringning',
  newsletter: 'Nyhetsbrev',
};

// Form type headings (Swedish)
export const FORM_TYPE_HEADINGS: Record<FormType, string> = {
  contact: 'Kontakta oss',
  quote: 'Begär offert',
  callback: 'Boka återringning',
  newsletter: 'Prenumerera på nyhetsbrev',
};

// Form type descriptions (Swedish)
export const FORM_TYPE_DESCRIPTIONS: Record<FormType, string> = {
  contact: 'Fyll i formuläret så återkommer vi så snart som möjligt.',
  quote: 'Berätta om ditt behov så skickar vi en kostnadsfri offert.',
  callback: 'Lämna ditt nummer så ringer vi upp dig.',
  newsletter: 'Få nyheter, tips och erbjudanden direkt i din inkorg.',
};

// Base contact form schema (client-side validation)
export const contactFormSchema = z.object({
  // Required fields
  name: z.string().min(2, 'Namnet måste vara minst 2 tecken'),
  email: z.string().email('Ogiltig e-postadress'),

  // Optional fields
  phone: z.string().optional(),
  company: z.string().optional(),
  orgNumber: z.string().optional(),
  message: z.string().optional(),

  // Consent
  marketingConsent: z.boolean().default(false),
});

// Extended schema for API submission (includes context)
export const contactFormSubmissionSchema = contactFormSchema.extend({
  // Form type
  formType: FormTypeSchema.default('contact'),

  // Context from URL params
  serviceCategory: ServiceCategorySchema.optional(),
  serviceSlug: z.string().optional(),
  productSlug: z.string().optional(),

  // Campaign tracking
  campaignId: z.string().optional(),
  variantId: z.string().optional(),

  // UTM parameters
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),

  // Page context
  page: z.string().optional(),

  // Turnstile token (optional for now, will be required later)
  turnstileToken: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ContactFormSubmission = z.infer<typeof contactFormSubmissionSchema>;

// Refined schemas for specific form types
export const callbackFormSchema = contactFormSchema.extend({
  phone: z.string().min(1, 'Telefonnummer krävs för återringning'),
});

export const newsletterFormSchema = z.object({
  email: z.string().email('Ogiltig e-postadress'),
  marketingConsent: z.boolean().refine((val) => val === true, {
    message: 'Du måste godkänna för att prenumerera',
  }),
});

// Helper to get the appropriate schema based on form type
export function getFormSchema(formType: FormType) {
  switch (formType) {
    case 'callback':
      return callbackFormSchema;
    case 'newsletter':
      return newsletterFormSchema;
    default:
      return contactFormSchema;
  }
}

// URL search params interface for contact page
export interface ContactPageParams {
  service?: ServiceCategory;
  slug?: string;
  product?: string;
  type?: FormType;
  campaign?: string;
  variant?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

// Field config interface (matches blocks.ts but repeated here for schema independence)
interface FieldConfig {
  id: string;
  enabled: boolean;
  required: boolean;
  label?: string;
  placeholder?: string;
}

/**
 * Build a dynamic validation schema based on field configuration
 * This allows forms to have different required fields based on admin configuration
 */
export function buildDynamicSchema(fields: FieldConfig[]) {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (!field.enabled) continue;

    switch (field.id) {
      case 'name':
        schemaShape.name = field.required
          ? z.string().min(2, 'Namnet måste vara minst 2 tecken')
          : z.string().optional();
        break;

      case 'email':
        schemaShape.email = field.required
          ? z.string().email('Ogiltig e-postadress')
          : z.string().email('Ogiltig e-postadress').optional().or(z.literal(''));
        break;

      case 'phone':
        schemaShape.phone = field.required
          ? z.string().min(1, 'Telefonnummer krävs')
          : z.string().optional();
        break;

      case 'company':
        schemaShape.company = field.required
          ? z.string().min(1, 'Företag krävs')
          : z.string().optional();
        break;

      case 'orgNumber':
        schemaShape.orgNumber = field.required
          ? z.string().min(1, 'Organisationsnummer krävs')
          : z.string().optional();
        break;

      case 'message':
        schemaShape.message = field.required
          ? z.string().min(10, 'Meddelandet måste vara minst 10 tecken')
          : z.string().optional();
        break;

      case 'marketingConsent':
        schemaShape.marketingConsent = field.required
          ? z.boolean().refine((val) => val === true, {
              message: 'Du måste godkänna för att fortsätta',
            })
          : z.boolean().default(false);
        break;

      case 'category':
        // Category is handled separately in the form, not in validation
        break;
    }
  }

  return z.object(schemaShape);
}
