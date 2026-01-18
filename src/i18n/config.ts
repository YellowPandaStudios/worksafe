// Supported locales
export const locales = ['sv', 'en'] as const;
export type Locale = (typeof locales)[number];

// Default locale (Swedish)
export const defaultLocale: Locale = 'sv';

// Locale labels for UI
export const localeLabels: Record<Locale, string> = {
  sv: 'Svenska',
  en: 'English',
};

// Locale flags for UI
export const localeFlags: Record<Locale, string> = {
  sv: '🇸🇪',
  en: '🇬🇧',
};
