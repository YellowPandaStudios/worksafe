import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Don't show /sv prefix for Swedish (default locale)
  localePrefix: 'as-needed',
});

// Navigation helpers with locale support
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
