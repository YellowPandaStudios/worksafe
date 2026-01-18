import { z } from 'zod';

// Form field configuration schema
const FormFieldConfigSchema = z.object({
  id: z.enum([
    'name',
    'email',
    'phone',
    'company',
    'orgNumber',
    'category',
    'message',
    'marketingConsent',
  ]),
  enabled: z.boolean(),
  required: z.boolean(),
  label: z.string().optional(),
  placeholder: z.string().optional(),
});

// Category option schema
const CategoryOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

// Form template schema for create/update
export const formTemplateSchema = z.object({
  name: z.string().min(1, 'Namn krävs'),
  slug: z
    .string()
    .min(1, 'Slug krävs')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug kan endast innehålla små bokstäver, siffror och bindestreck'
    ),
  description: z.string().optional().nullable(),

  // Form configuration
  preset: z.enum(['contact', 'quote', 'callback', 'newsletter']).default('contact'),
  fields: z.array(FormFieldConfigSchema).default([]),
  categoryMode: z.enum(['system', 'custom', 'hidden']).default('system'),
  categoryLabel: z.string().optional().nullable(),
  customCategories: z.array(CategoryOptionSchema).default([]),
  submitButtonText: z.string().optional().nullable(),
  successMessage: z.string().optional().nullable(),

  // Default content
  defaultTitle: z.string().optional().nullable(),
  defaultSubtitle: z.string().optional().nullable(),

  // Status
  isActive: z.boolean().default(true),
});

export type FormTemplateFormData = z.infer<typeof formTemplateSchema>;
export type FormTemplateFormInput = z.input<typeof formTemplateSchema>;

// Schema for API responses
export const formTemplateResponseSchema = formTemplateSchema.extend({
  id: z.string(),
  usageCount: z.number(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type FormTemplateResponse = z.infer<typeof formTemplateResponseSchema>;
