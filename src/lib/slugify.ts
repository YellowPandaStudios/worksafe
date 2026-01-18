import slugifyLib from 'slugify';

// Swedish character replacements (å/ä → a, ö → o)
const SWEDISH_CHARS: Record<string, string> = {
  'å': 'a',
  'ä': 'a',
  'ö': 'o',
  'Å': 'a',
  'Ä': 'a',
  'Ö': 'o',
};

/**
 * Generate a URL-friendly slug from Swedish text
 * Converts å/ä/ö to a/a/o, lowercases, and replaces spaces with hyphens
 */
export function slugify(text: string): string {
  if (!text) return '';

  // Pre-process Swedish characters
  const processed = text.replace(/[åäöÅÄÖ]/g, (char) => SWEDISH_CHARS[char] || char);

  return slugifyLib(processed, {
    lower: true,
    strict: true,
    replacement: '-',
  });
}

/**
 * Generate a slug and ensure it's unique by appending a number if needed
 * This is a helper for the API routes to check uniqueness
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
