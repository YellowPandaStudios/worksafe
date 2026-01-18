import type {
  FormFieldId,
  FormFieldConfig,
  FormPreset,
  ContactFormBlock,
  CategoryMode,
} from '@/types/blocks';

// Default labels and placeholders for each field (Swedish)
export const FORM_FIELD_DEFAULTS: Record<
  FormFieldId,
  { label: string; placeholder: string }
> = {
  name: {
    label: 'Namn',
    placeholder: 'Ditt namn',
  },
  email: {
    label: 'E-postadress',
    placeholder: 'din@email.se',
  },
  phone: {
    label: 'Telefon',
    placeholder: '070-123 45 67',
  },
  company: {
    label: 'Företag',
    placeholder: 'Företagsnamn',
  },
  orgNumber: {
    label: 'Organisationsnummer',
    placeholder: 'XXXXXX-XXXX',
  },
  category: {
    label: 'Vad gäller din förfrågan?',
    placeholder: 'Välj område',
  },
  message: {
    label: 'Meddelande',
    placeholder: 'Ditt meddelande...',
  },
  marketingConsent: {
    label: 'Jag godkänner att ta emot information och erbjudanden via e-post',
    placeholder: '',
  },
};

// Field order for consistent display
export const FORM_FIELD_ORDER: FormFieldId[] = [
  'name',
  'email',
  'phone',
  'company',
  'orgNumber',
  'category',
  'message',
  'marketingConsent',
];

// Preset configurations
export const FORM_PRESETS: Record<
  FormPreset,
  {
    title: string;
    subtitle: string;
    fields: FormFieldConfig[];
    categoryMode: CategoryMode;
    submitButtonText: string;
    successMessage: string;
  }
> = {
  contact: {
    title: 'Kontakta oss',
    subtitle: 'Vi återkommer så snart vi kan',
    fields: [
      { id: 'name', enabled: true, required: true },
      { id: 'email', enabled: true, required: true },
      { id: 'phone', enabled: true, required: false },
      { id: 'company', enabled: true, required: false },
      { id: 'orgNumber', enabled: false, required: false },
      { id: 'category', enabled: true, required: false },
      { id: 'message', enabled: true, required: false },
      { id: 'marketingConsent', enabled: true, required: false },
    ],
    categoryMode: 'system',
    submitButtonText: 'Skicka meddelande',
    successMessage: 'Tack för ditt meddelande! Vi återkommer så snart vi kan.',
  },

  quote: {
    title: 'Begär offert',
    subtitle: 'Beskriv ditt behov så återkommer vi med pris',
    fields: [
      { id: 'name', enabled: true, required: true },
      { id: 'email', enabled: true, required: true },
      { id: 'phone', enabled: true, required: true },
      { id: 'company', enabled: true, required: true },
      { id: 'orgNumber', enabled: true, required: false },
      { id: 'category', enabled: true, required: true },
      {
        id: 'message',
        enabled: true,
        required: true,
        label: 'Beskriv ditt behov',
        placeholder: 'Berätta om ert behov, antal deltagare, önskat datum etc.',
      },
      { id: 'marketingConsent', enabled: true, required: false },
    ],
    categoryMode: 'system',
    submitButtonText: 'Skicka offertförfrågan',
    successMessage: 'Tack! Vi skickar en offert till dig inom kort.',
  },

  callback: {
    title: 'Boka återringning',
    subtitle: 'Lämna ditt nummer så ringer vi upp dig',
    fields: [
      { id: 'name', enabled: true, required: true },
      { id: 'email', enabled: false, required: false },
      { id: 'phone', enabled: true, required: true },
      { id: 'company', enabled: true, required: false },
      { id: 'orgNumber', enabled: false, required: false },
      { id: 'category', enabled: true, required: false },
      { id: 'message', enabled: false, required: false },
      { id: 'marketingConsent', enabled: false, required: false },
    ],
    categoryMode: 'hidden',
    submitButtonText: 'Ring mig',
    successMessage: 'Tack! Vi ringer dig så snart vi kan.',
  },

  newsletter: {
    title: 'Prenumerera på nyhetsbrev',
    subtitle: 'Få nyheter, tips och erbjudanden direkt i din inkorg',
    fields: [
      { id: 'name', enabled: false, required: false },
      { id: 'email', enabled: true, required: true },
      { id: 'phone', enabled: false, required: false },
      { id: 'company', enabled: false, required: false },
      { id: 'orgNumber', enabled: false, required: false },
      { id: 'category', enabled: false, required: false },
      { id: 'message', enabled: false, required: false },
      {
        id: 'marketingConsent',
        enabled: true,
        required: true,
        label: 'Jag godkänner att ta emot nyhetsbrev och marknadskommunikation',
      },
    ],
    categoryMode: 'hidden',
    submitButtonText: 'Prenumerera',
    successMessage: 'Tack för din prenumeration! Kolla din inkorg för bekräftelse.',
  },
};

// Preset labels for the UI
export const FORM_PRESET_LABELS: Record<FormPreset, string> = {
  contact: 'Kontaktformulär',
  quote: 'Offertförfrågan',
  callback: 'Återringning',
  newsletter: 'Nyhetsbrev',
};

/**
 * Get the full preset configuration
 */
export function getPresetConfig(preset: FormPreset) {
  return FORM_PRESETS[preset];
}

/**
 * Get field configuration with defaults merged
 */
export function getFieldWithDefaults(field: FormFieldConfig): FormFieldConfig & {
  label: string;
  placeholder: string;
} {
  const defaults = FORM_FIELD_DEFAULTS[field.id];
  return {
    ...field,
    label: field.label || defaults.label,
    placeholder: field.placeholder || defaults.placeholder,
  };
}

/**
 * Get all fields with defaults merged
 */
export function getFieldsWithDefaults(
  fields: FormFieldConfig[]
): Array<FormFieldConfig & { label: string; placeholder: string }> {
  return fields.map(getFieldWithDefaults);
}

/**
 * Create a complete block configuration from a preset
 */
export function createBlockFromPreset(preset: FormPreset): Partial<ContactFormBlock> {
  const config = FORM_PRESETS[preset];
  return {
    preset,
    title: config.title,
    subtitle: config.subtitle,
    fields: config.fields.map((f) => ({ ...f })), // Deep copy
    categoryMode: config.categoryMode,
    submitButtonText: config.submitButtonText,
    successMessage: config.successMessage,
  };
}

/**
 * Merge custom fields with preset defaults
 * Preserves customizations while ensuring all fields exist
 */
export function mergeFieldsWithPreset(
  customFields: FormFieldConfig[] | undefined,
  preset: FormPreset
): FormFieldConfig[] {
  const presetFields = FORM_PRESETS[preset].fields;

  if (!customFields || customFields.length === 0) {
    return presetFields.map((f) => ({ ...f }));
  }

  // Create a map of custom fields by id
  const customFieldMap = new Map(customFields.map((f) => [f.id, f]));

  // Merge: use custom field if exists, otherwise use preset field
  return presetFields.map((presetField) => {
    const customField = customFieldMap.get(presetField.id);
    if (customField) {
      return { ...customField };
    }
    return { ...presetField };
  });
}

/**
 * Check if fields have been customized from the preset
 */
export function hasCustomizedFields(
  fields: FormFieldConfig[] | undefined,
  preset: FormPreset
): boolean {
  if (!fields) return false;

  const presetFields = FORM_PRESETS[preset].fields;

  for (const field of fields) {
    const presetField = presetFields.find((f) => f.id === field.id);
    if (!presetField) continue;

    if (
      field.enabled !== presetField.enabled ||
      field.required !== presetField.required ||
      (field.label && field.label !== FORM_FIELD_DEFAULTS[field.id].label) ||
      (field.placeholder && field.placeholder !== FORM_FIELD_DEFAULTS[field.id].placeholder)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Get enabled fields from a field configuration
 */
export function getEnabledFields(
  fields: FormFieldConfig[]
): Array<FormFieldConfig & { label: string; placeholder: string }> {
  return fields.filter((f) => f.enabled).map(getFieldWithDefaults);
}
