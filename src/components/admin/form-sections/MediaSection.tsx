'use client';

import {
  type UseFormReturn,
  type FieldValues,
  type Path,
  type PathValue,
} from 'react-hook-form';
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

export interface MediaSectionProps<T extends FieldValues> {
  /** React Hook Form instance */
  form: UseFormReturn<T>;
  /** Image field name */
  imageField?: string;
  /** Alt text field name */
  altField?: string;
  /** Section title */
  title?: string;
  /** Field label */
  label?: string;
  /** Field description */
  description?: string;
  /** Show alt text input */
  showAlt?: boolean;
  /** Alt text placeholder */
  altPlaceholder?: string;
  /** Additional className */
  className?: string;
}

/**
 * Reusable media/image section for admin forms.
 * Includes image picker and optional alt text input.
 *
 * @example
 * ```tsx
 * <MediaSection
 *   form={form}
 *   imageField="heroImage"
 *   altField="heroImageAlt"
 *   title="Hero-bild"
 *   showAlt
 * />
 * ```
 */
export function MediaSection<T extends FieldValues>({
  form,
  imageField = 'image',
  altField = 'imageAlt',
  title,
  label = 'Bild',
  description,
  showAlt = true,
  altPlaceholder = 'Alt-text för bilden',
  className,
}: MediaSectionProps<T>): React.ReactElement {
  const imagePath = imageField as Path<T>;
  const altPath = altField as Path<T>;

  const imageValue = form.watch(imagePath);
  const altValue = form.watch(altPath) || '';

  const content = (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <ImagePicker
          value={imageValue as string | null}
          onChange={(url) =>
            form.setValue(imagePath, url as PathValue<T, Path<T>>)
          }
        />
        {showAlt && imageValue && (
          <Input
            value={altValue as string}
            onChange={(e) =>
              form.setValue(altPath, e.target.value as PathValue<T, Path<T>>)
            }
            placeholder={altPlaceholder}
            className="mt-2"
          />
        )}
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
    </Field>
  );

  if (title) {
    return (
      <FieldSet className={className}>
        <FieldLegend className="admin-form-section-title">{title}</FieldLegend>
        <FieldGroup>{content}</FieldGroup>
      </FieldSet>
    );
  }

  return <div className={className}>{content}</div>;
}

export interface HeroSectionProps<T extends FieldValues> {
  /** React Hook Form instance */
  form: UseFormReturn<T>;
  /** Show hero title field */
  showHeroTitle?: boolean;
  /** Show hero subtitle field */
  showHeroSubtitle?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Hero section with title, subtitle, and image.
 * Commonly used in service, page, and post forms.
 *
 * @example
 * ```tsx
 * <HeroSection form={form} showHeroTitle showHeroSubtitle />
 * ```
 */
export function HeroSection<T extends FieldValues>({
  form,
  showHeroTitle = true,
  showHeroSubtitle = true,
  className,
}: HeroSectionProps<T>): React.ReactElement {
  const heroTitle = form.watch('heroTitle' as Path<T>) || '';
  const heroSubtitle = form.watch('heroSubtitle' as Path<T>) || '';
  const heroImage = form.watch('heroImage' as Path<T>);
  const heroImageAlt = form.watch('heroImageAlt' as Path<T>) || '';

  return (
    <FieldSet className={className}>
      <FieldLegend className="admin-form-section-title">Hero-sektion</FieldLegend>
      <FieldGroup className="gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Text fields */}
          <div className="space-y-4">
            {showHeroTitle && (
              <Field>
                <FieldLabel htmlFor="heroTitle">Hero-rubrik</FieldLabel>
                <FieldContent>
                  <Input
                    id="heroTitle"
                    value={heroTitle as string}
                    onChange={(e) =>
                      form.setValue(
                        'heroTitle' as Path<T>,
                        e.target.value as PathValue<T, Path<T>>
                      )
                    }
                    placeholder="Lämna tomt för att använda titeln"
                  />
                </FieldContent>
              </Field>
            )}

            {showHeroSubtitle && (
              <Field>
                <FieldLabel htmlFor="heroSubtitle">Hero-underrubrik</FieldLabel>
                <FieldContent>
                  <Input
                    id="heroSubtitle"
                    value={heroSubtitle as string}
                    onChange={(e) =>
                      form.setValue(
                        'heroSubtitle' as Path<T>,
                        e.target.value as PathValue<T, Path<T>>
                      )
                    }
                  />
                </FieldContent>
              </Field>
            )}
          </div>

          {/* Image field */}
          <Field>
            <FieldLabel>Hero-bild</FieldLabel>
            <FieldContent>
              <ImagePicker
                value={heroImage as string | null}
                onChange={(url) =>
                  form.setValue(
                    'heroImage' as Path<T>,
                    url as PathValue<T, Path<T>>
                  )
                }
              />
              {heroImage && (
                <Input
                  value={heroImageAlt as string}
                  onChange={(e) =>
                    form.setValue(
                      'heroImageAlt' as Path<T>,
                      e.target.value as PathValue<T, Path<T>>
                    )
                  }
                  placeholder="Alt-text för bilden"
                  className="mt-2"
                />
              )}
            </FieldContent>
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  );
}
