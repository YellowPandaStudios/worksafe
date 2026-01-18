'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  type UseFormReturn,
  type FieldValues,
  type Path,
  type PathValue,
} from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldGroup,
  FieldDescription,
} from '@/components/ui/field';
import { slugify } from '@/lib/slugify';
import { cn } from '@/lib/utils';

export interface CategoryOption {
  id: string;
  name: string;
  depth?: number;
}

export interface BasicInfoSectionProps<T extends FieldValues> {
  /** React Hook Form instance */
  form: UseFormReturn<T>;
  /** Title field name (default: 'title') */
  titleField?: string;
  /** Title label */
  titleLabel?: string;
  /** Slug field name (default: 'slug') */
  slugField?: string;
  /** Show short description field */
  showDescription?: boolean;
  /** Description field name */
  descriptionField?: string;
  /** Description label */
  descriptionLabel?: string;
  /** Description rows */
  descriptionRows?: number;
  /** Show category field */
  showCategory?: boolean;
  /** Category field name */
  categoryField?: string;
  /** Category options */
  categories?: CategoryOption[];
  /** Category loading state */
  loadingCategories?: boolean;
  /** Base URL for slug preview */
  baseUrl?: string;
  /** Is this a new item (enables auto-slug generation) */
  isNew?: boolean;
  /** Additional fields to render between title/slug and description */
  additionalFields?: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Reusable basic info section with title, slug, category, and description.
 * Includes auto-slug generation and URL preview.
 *
 * @example
 * ```tsx
 * <BasicInfoSection
 *   form={form}
 *   titleLabel="Tjänstnamn"
 *   showDescription
 *   descriptionLabel="Kort beskrivning"
 *   showCategory
 *   categories={categories}
 *   baseUrl="/tjanster"
 *   isNew={!initialData}
 * />
 * ```
 */
export function BasicInfoSection<T extends FieldValues>({
  form,
  titleField = 'title',
  titleLabel = 'Titel',
  slugField = 'slug',
  showDescription = false,
  descriptionField = 'shortDescription',
  descriptionLabel = 'Kort beskrivning',
  descriptionRows = 3,
  showCategory = false,
  categoryField = 'categoryId',
  categories = [],
  loadingCategories = false,
  baseUrl,
  isNew = false,
  additionalFields,
  className,
}: BasicInfoSectionProps<T>): React.ReactElement {
  const [autoGeneratingSlug, setAutoGeneratingSlug] = useState(false);

  // Type-safe field paths
  const titlePath = titleField as Path<T>;
  const slugPath = slugField as Path<T>;
  const categoryPath = categoryField as Path<T>;
  const descriptionPath = descriptionField as Path<T>;

  // Get current values
  const title = form.watch(titlePath) || '';
  const slug = form.watch(slugPath) || '';
  const categoryId = form.watch(categoryPath);
  const description = form.watch(descriptionPath) || '';

  // Get errors (use any to avoid complex generic type issues with dynamic field names)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errors = form.formState.errors as any;
  const titleError = errors[titleField];
  const slugError = errors[slugField];
  const descriptionError = errors[descriptionField];

  // Auto-generate slug from title for new items
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dirtyFields = form.formState.dirtyFields as any;
    if (isNew && !autoGeneratingSlug && title && !dirtyFields[slugField]) {
      const generatedSlug = slugify(title as string);
      if (generatedSlug) {
        form.setValue(slugPath, generatedSlug as PathValue<T, Path<T>>, {
          shouldDirty: false,
        });
      }
    }
  }, [title, isNew, autoGeneratingSlug, form, slugPath, slugField]);

  // Manual slug generation
  const generateSlug = useCallback(() => {
    setAutoGeneratingSlug(true);
    const generated = slugify(title as string);
    form.setValue(slugPath, generated as PathValue<T, Path<T>>);
    setAutoGeneratingSlug(false);
  }, [title, form, slugPath]);

  // Build preview URL
  const previewUrl = baseUrl && slug ? `${baseUrl}/${slug}` : null;

  return (
    <FieldSet className={className}>
      <FieldGroup className="gap-4">
        {/* Title and Slug row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor={titlePath}>{titleLabel} *</FieldLabel>
            <FieldContent>
              <Input
                id={titlePath}
                {...form.register(titlePath)}
                aria-invalid={!!titleError}
              />
              <FieldError errors={[titleError]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor={slugPath}>Slug *</FieldLabel>
            <FieldContent>
              <div className="flex gap-2">
                <Input
                  id={slugPath}
                  {...form.register(slugPath)}
                  aria-invalid={!!slugError}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={generateSlug}>
                  Generera
                </Button>
              </div>
              <FieldError errors={[slugError]} />
            </FieldContent>
          </Field>
        </div>

        {/* URL Preview */}
        {previewUrl && (
          <div className="text-sm text-muted-foreground px-1">
            URL:{' '}
            <code className="bg-muted px-1.5 py-0.5 rounded">{previewUrl}</code>
          </div>
        )}

        {/* Category field */}
        {showCategory && (
          <Field>
            <FieldLabel htmlFor={categoryPath}>Kategori</FieldLabel>
            <FieldContent>
              <Select
                value={(categoryId as string) || '_none'}
                onValueChange={(value) =>
                  form.setValue(
                    categoryPath,
                    (value === '_none' ? null : value) as PathValue<T, Path<T>>
                  )
                }
                disabled={loadingCategories}
              >
                <SelectTrigger id={categoryPath}>
                  <SelectValue placeholder="Välj kategori..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">(Ingen kategori)</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.depth ? '—'.repeat(cat.depth) + ' ' : ''}
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        )}

        {/* Additional fields slot */}
        {additionalFields}

        {/* Description field */}
        {showDescription && (
          <Field>
            <FieldLabel htmlFor={descriptionPath}>{descriptionLabel} *</FieldLabel>
            <FieldContent>
              <Textarea
                id={descriptionPath}
                {...form.register(descriptionPath)}
                rows={descriptionRows}
                aria-invalid={!!descriptionError}
              />
              <FieldError errors={[descriptionError]} />
            </FieldContent>
          </Field>
        )}
      </FieldGroup>
    </FieldSet>
  );
}
