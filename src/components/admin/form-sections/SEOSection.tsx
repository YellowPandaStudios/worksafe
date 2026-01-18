'use client';

import { type UseFormReturn, type FieldValues, type Path } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { ImagePicker } from '../media/ImagePicker';
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldSet,
  FieldGroup,
  FieldLegend,
  FieldDescription,
} from '@/components/ui/field';
import {
  MetaTitleInput,
  MetaDescriptionTextarea,
} from '../common/CharacterCountInput';

export interface SEOSectionProps<T extends FieldValues> {
  /** React Hook Form instance */
  form: UseFormReturn<T>;
  /** Field name prefix for nested forms (e.g., 'seo') */
  prefix?: string;
  /** Show OG image field */
  showOgImage?: boolean;
  /** Show canonical URL field */
  showCanonical?: boolean;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Additional className */
  className?: string;
}

/**
 * Reusable SEO fields section for admin forms.
 * Includes meta title, meta description, OG image, and canonical URL.
 *
 * @example
 * ```tsx
 * <SEOSection form={form} showOgImage showCanonical />
 * ```
 */
export function SEOSection<T extends FieldValues>({
  form,
  prefix,
  showOgImage = true,
  showCanonical = true,
  title = 'Sökmotoroptimering (SEO)',
  description = 'Optimera hur sidan visas i sökmotorer och sociala medier.',
  className,
}: SEOSectionProps<T>): React.ReactElement {
  // Helper to get field path with optional prefix
  const getFieldPath = (field: string): Path<T> =>
    (prefix ? `${prefix}.${field}` : field) as Path<T>;

  // Get current values
  const metaTitle = form.watch(getFieldPath('metaTitle')) || '';
  const metaDescription = form.watch(getFieldPath('metaDescription')) || '';
  const ogImage = form.watch(getFieldPath('ogImage'));
  const canonicalUrl = form.watch(getFieldPath('canonicalUrl')) || '';

  return (
    <FieldSet className={className}>
      <FieldLegend className="admin-form-section-title">{title}</FieldLegend>
      {description && (
        <p className="text-sm text-muted-foreground -mt-2 mb-4">{description}</p>
      )}
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor={getFieldPath('metaTitle')}>Meta-titel</FieldLabel>
          <FieldContent>
            <MetaTitleInput
              value={metaTitle as string}
              onChange={(value) =>
                form.setValue(getFieldPath('metaTitle'), value as T[Path<T>])
              }
              placeholder="Sidans titel i sökmotorer"
            />
            <FieldDescription>
              Titeln som visas i sökresultat. Rekommenderat: 50-60 tecken.
            </FieldDescription>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor={getFieldPath('metaDescription')}>
            Meta-beskrivning
          </FieldLabel>
          <FieldContent>
            <MetaDescriptionTextarea
              value={metaDescription as string}
              onChange={(value) =>
                form.setValue(
                  getFieldPath('metaDescription'),
                  value as T[Path<T>]
                )
              }
              placeholder="Kort beskrivning av sidans innehåll"
            />
            <FieldDescription>
              Beskrivningen som visas i sökresultat. Rekommenderat: 150-160
              tecken.
            </FieldDescription>
          </FieldContent>
        </Field>

        {showOgImage && (
          <Field>
            <FieldLabel>OG-bild (delningsbild)</FieldLabel>
            <FieldContent>
              <ImagePicker
                value={ogImage as string | null}
                onChange={(url) =>
                  form.setValue(getFieldPath('ogImage'), url as T[Path<T>])
                }
              />
              <FieldDescription>
                Bilden som visas när sidan delas på sociala medier.
                Rekommenderad storlek: 1200x630px.
              </FieldDescription>
            </FieldContent>
          </Field>
        )}

        {showCanonical && (
          <Field>
            <FieldLabel htmlFor={getFieldPath('canonicalUrl')}>
              Canonical URL
            </FieldLabel>
            <FieldContent>
              <Input
                id={getFieldPath('canonicalUrl')}
                value={canonicalUrl as string}
                onChange={(e) =>
                  form.setValue(
                    getFieldPath('canonicalUrl'),
                    e.target.value as T[Path<T>]
                  )
                }
                placeholder="https://worksafe.se/original-page"
              />
              <FieldDescription>
                Lämna tomt om sidan är unik - då används sidans egen URL
                automatiskt. Ange endast om innehållet finns på en annan URL.
              </FieldDescription>
            </FieldContent>
          </Field>
        )}
      </FieldGroup>
    </FieldSet>
  );
}
