'use client';

import { ContactFormBlock } from '@/types/blocks';
import { SmartContactForm } from '@/components/forms/SmartContactForm';

interface ContactFormProps {
  block: ContactFormBlock;
  // Optional context from URL or parent component
  serviceCategory?: string;
  serviceSlug?: string;
  productSlug?: string;
  campaignId?: string;
  variantId?: string;
}

export function ContactForm({
  block,
  serviceCategory,
  serviceSlug,
  productSlug,
  campaignId,
  variantId,
}: ContactFormProps) {
  const {
    title,
    subtitle,
    preset,
    formType,
    fields,
    categoryMode,
    categoryLabel,
    customCategories,
    categoryId,
    submitButtonText,
    successMessage,
  } = block;

  return (
    <div className="max-w-xl mx-auto">
      <SmartContactForm
        // New preset-based configuration
        preset={preset}
        fields={fields}
        categoryMode={categoryMode}
        categoryLabel={categoryLabel}
        customCategories={customCategories}
        submitButtonText={submitButtonText}
        
        // Legacy support
        formType={formType || preset}
        
        // Context
        serviceCategory={serviceCategory as any}
        serviceSlug={serviceSlug}
        productSlug={productSlug}
        campaignId={campaignId}
        variantId={variantId}
        
        // Content
        heading={title}
        description={subtitle}
        successMessage={successMessage}
      />
    </div>
  );
}
