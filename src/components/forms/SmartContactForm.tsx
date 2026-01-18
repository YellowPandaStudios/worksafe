'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Send, Phone, Mail, Building2, User, Hash, MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import type {
  FormFieldConfig,
  FormFieldId,
  FormPreset,
  CategoryOption,
  CategoryMode,
} from '@/types/blocks';
import {
  FORM_PRESETS,
  FORM_FIELD_DEFAULTS,
  getFieldWithDefaults,
  mergeFieldsWithPreset,
} from '@/lib/form-presets';
import {
  type ContactFormSubmission,
  type ServiceCategory,
  SERVICE_CATEGORY_LABELS,
  buildDynamicSchema,
} from '@/schemas/contact-form';

// Icons for each field type
const FIELD_ICONS: Partial<Record<FormFieldId, React.ComponentType<{ className?: string }>>> = {
  name: User,
  email: Mail,
  phone: Phone,
  company: Building2,
  orgNumber: Hash,
  message: MessageSquare,
};

interface SmartContactFormProps {
  // Preset-based configuration (new)
  preset?: FormPreset;
  fields?: FormFieldConfig[];
  categoryMode?: CategoryMode;
  categoryLabel?: string;
  customCategories?: CategoryOption[];
  submitButtonText?: string;
  
  // Legacy form type (backwards compatibility)
  formType?: FormPreset;
  
  // Pre-selected service category
  serviceCategory?: ServiceCategory;
  
  // Service or product slug for context
  serviceSlug?: string;
  productSlug?: string;
  
  // Campaign tracking
  campaignId?: string;
  variantId?: string;
  
  // UTM parameters
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  
  // Current page URL
  currentPage?: string;
  
  // Custom success message
  successMessage?: string;
  
  // Custom heading override
  heading?: string;
  
  // Custom description override
  description?: string;
  
  // Product name for message placeholder
  productName?: string;
  
  // Service name for context
  serviceName?: string;
  
  // Callback on successful submission
  onSuccess?: () => void;
  
  // Custom class name
  className?: string;
}

export function SmartContactForm({
  preset,
  fields: customFields,
  categoryMode: customCategoryMode,
  categoryLabel,
  customCategories,
  submitButtonText: customSubmitButtonText,
  formType,
  serviceCategory,
  serviceSlug,
  productSlug,
  campaignId,
  variantId,
  utmSource,
  utmMedium,
  utmCampaign,
  utmTerm,
  utmContent,
  currentPage,
  successMessage,
  heading,
  description,
  productName,
  serviceName,
  onSuccess,
  className,
}: SmartContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    serviceCategory
  );

  // Determine effective preset (new preset prop takes precedence)
  const effectivePreset = preset || formType || 'contact';
  const presetConfig = FORM_PRESETS[effectivePreset];
  
  // Get field configuration (custom fields or from preset)
  const fields = useMemo(() => {
    if (customFields && customFields.length > 0) {
      return customFields;
    }
    return mergeFieldsWithPreset(undefined, effectivePreset);
  }, [customFields, effectivePreset]);
  
  // Get enabled fields with defaults
  const enabledFields = useMemo(() => {
    return fields.filter((f) => f.enabled).map(getFieldWithDefaults);
  }, [fields]);
  
  // Determine category mode
  const categoryMode = customCategoryMode || presetConfig.categoryMode;
  
  // Build dynamic validation schema
  const validationSchema = useMemo(() => {
    return buildDynamicSchema(enabledFields);
  }, [enabledFields]);

  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      orgNumber: '',
      message: '',
      marketingConsent: false,
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;

  // Get field by ID
  const getField = (id: FormFieldId) => enabledFields.find((f) => f.id === id);
  
  // Check if field is enabled
  const isFieldEnabled = (id: FormFieldId) => enabledFields.some((f) => f.id === id);
  
  // Check if field is required
  const isFieldRequired = (id: FormFieldId) => {
    const field = getField(id);
    return field?.required || false;
  };

  // Get message placeholder based on context
  const getMessagePlaceholder = (): string => {
    const field = getField('message');
    if (field?.placeholder) return field.placeholder;
    if (productName) return `Jag är intresserad av ${productName}...`;
    if (serviceName) return `Jag har frågor om ${serviceName}...`;
    return FORM_FIELD_DEFAULTS.message.placeholder;
  };

  // Get submit button text
  const buttonText = customSubmitButtonText || presetConfig.submitButtonText;
  
  // Get success message
  const finalSuccessMessage = successMessage || presetConfig.successMessage;

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);

    try {
      const submission: ContactFormSubmission = {
        name: (data.name as string) || '',
        email: (data.email as string) || '',
        phone: data.phone as string | undefined,
        company: data.company as string | undefined,
        orgNumber: data.orgNumber as string | undefined,
        message: data.message as string | undefined,
        marketingConsent: (data.marketingConsent as boolean) || false,
        formType: effectivePreset,
        serviceCategory: (selectedCategory as ServiceCategory) || serviceCategory,
        serviceSlug,
        productSlug,
        campaignId,
        variantId,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
        page: currentPage || (typeof window !== 'undefined' ? window.location.href : undefined),
      };

      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Något gick fel');
      }

      setIsSuccess(true);
      toast.success('Meddelandet skickades!');
      onSuccess?.();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Kunde inte skicka meddelandet');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className={cn('rounded-xl bg-green-50 dark:bg-green-950/20 p-8 text-center', className)}>
        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
          Tack!
        </h3>
        <p className="text-green-700 dark:text-green-300">
          {finalSuccessMessage}
        </p>
      </div>
    );
  }

  // Render a field based on its configuration
  const renderField = (fieldId: FormFieldId) => {
    const field = getField(fieldId);
    if (!field) return null;

    const Icon = FIELD_ICONS[fieldId];
    const error = errors[fieldId as keyof typeof errors];

    switch (fieldId) {
      case 'name':
      case 'email':
      case 'phone':
      case 'company':
      case 'orgNumber':
        return (
          <div key={fieldId} className="space-y-2">
            <Label htmlFor={fieldId} className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4" />}
              {field.label} {field.required && '*'}
            </Label>
            <Input
              id={fieldId}
              type={fieldId === 'email' ? 'email' : fieldId === 'phone' ? 'tel' : 'text'}
              placeholder={field.placeholder}
              {...register(fieldId)}
              className={cn(error && 'border-red-500')}
            />
            {error && (
              <p className="text-sm text-red-500">{error.message as string}</p>
            )}
          </div>
        );

      case 'message':
        return (
          <div key={fieldId} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.label} {field.required && '*'}
            </Label>
            <Textarea
              id={fieldId}
              placeholder={getMessagePlaceholder()}
              rows={4}
              {...register(fieldId)}
              className={cn(error && 'border-red-500')}
            />
            {error && (
              <p className="text-sm text-red-500">{error.message as string}</p>
            )}
          </div>
        );

      case 'marketingConsent':
        return (
          <div key={fieldId} className="flex items-start gap-3">
            <Checkbox
              id={fieldId}
              checked={watch('marketingConsent') as boolean}
              onCheckedChange={(checked) => setValue('marketingConsent', checked === true)}
              className={cn(error && 'border-red-500')}
            />
            <div className="space-y-1">
              <Label htmlFor={fieldId} className="text-sm font-normal cursor-pointer">
                {field.label} {field.required && '*'}
              </Label>
              {error && (
                <p className="text-sm text-red-500">{error.message as string}</p>
              )}
            </div>
          </div>
        );

      case 'category':
        // Category is handled separately
        return null;

      default:
        return null;
    }
  };

  // Render category select
  const renderCategorySelect = () => {
    if (categoryMode === 'hidden') return null;
    if (!isFieldEnabled('category')) return null;

    const field = getField('category');
    const label = categoryLabel || field?.label || FORM_FIELD_DEFAULTS.category.label;
    const required = field?.required || false;

    // If we have a pre-selected category from URL params, show it as info
    if (serviceCategory && categoryMode === 'system') {
      return (
        <div className="rounded-lg bg-muted px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {label}: <span className="font-medium text-foreground">
              {SERVICE_CATEGORY_LABELS[serviceCategory]}
            </span>
          </p>
        </div>
      );
    }

    const options = categoryMode === 'custom' && customCategories?.length
      ? customCategories
      : Object.entries(SERVICE_CATEGORY_LABELS).map(([value, label]) => ({
          value,
          label,
        }));

    return (
      <div className="space-y-2">
        <Label>{label} {required && '*'}</Label>
        <Select
          value={selectedCategory || '_none'}
          onValueChange={(value) => setSelectedCategory(value === '_none' ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={FORM_FIELD_DEFAULTS.category.placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">{FORM_FIELD_DEFAULTS.category.placeholder}</SelectItem>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header - only show if heading or description provided */}
      {(heading || description) && (
        <div className="space-y-2">
          {heading && (
            <h2 className="text-2xl font-bold text-foreground">{heading}</h2>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Render fields in order, excluding category */}
        {['name', 'email', 'phone', 'company', 'orgNumber'].map((id) =>
          renderField(id as FormFieldId)
        )}

        {/* Category select */}
        {renderCategorySelect()}

        {/* Message field */}
        {renderField('message')}

        {/* Marketing consent */}
        {renderField('marketingConsent')}

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Skickar...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {buttonText}
            </>
          )}
        </Button>

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground text-center">
          Genom att skicka detta formulär godkänner du vår{' '}
          <a href="/integritetspolicy" className="underline hover:text-foreground">
            integritetspolicy
          </a>
          .
        </p>
      </form>
    </div>
  );
}
