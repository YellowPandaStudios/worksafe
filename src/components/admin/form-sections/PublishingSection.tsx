'use client';

import { type UseFormReturn, type FieldValues, type Path } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
  FieldLabel,
  FieldSet,
  FieldGroup,
  FieldLegend,
  FieldDescription,
} from '@/components/ui/field';

export type ContentStatus = 'draft' | 'published' | 'archived';

export interface StatusOption {
  value: string;
  label: string;
}

export interface PublishingSectionProps<T extends FieldValues> {
  /** React Hook Form instance */
  form: UseFormReturn<T>;
  /** Field name prefix for nested forms */
  prefix?: string;
  /** Show scheduling fields */
  showScheduling?: boolean;
  /** Show sort order field */
  showSortOrder?: boolean;
  /** Show featured toggle */
  showFeatured?: boolean;
  /** Custom featured field name */
  featuredField?: string;
  /** Custom statuses (replaces default draft/published/archived) */
  statusOptions?: StatusOption[];
  /** Section title */
  title?: string;
  /** Additional fields to render */
  additionalFields?: React.ReactNode;
  /** Additional className */
  className?: string;
}

const DEFAULT_STATUS_OPTIONS: StatusOption[] = [
  { value: 'draft', label: 'Utkast' },
  { value: 'published', label: 'Publicerad' },
  { value: 'archived', label: 'Arkiverad' },
];

/**
 * Reusable publishing fields section for admin forms.
 * Includes status, sort order, featured toggle, and scheduling.
 *
 * @example
 * ```tsx
 * <PublishingSection
 *   form={form}
 *   showSortOrder
 *   showFeatured
 *   showScheduling
 * />
 * ```
 */
export function PublishingSection<T extends FieldValues>({
  form,
  prefix,
  showScheduling = false,
  showSortOrder = true,
  showFeatured = false,
  featuredField = 'featured',
  statusOptions = DEFAULT_STATUS_OPTIONS,
  title = 'Publicering',
  additionalFields,
  className,
}: PublishingSectionProps<T>): React.ReactElement {
  // Helper to get field path with optional prefix
  const getFieldPath = (field: string): Path<T> =>
    (prefix ? `${prefix}.${field}` : field) as Path<T>;

  // Get current values
  const status = form.watch(getFieldPath('status')) || 'draft';
  const sortOrder = form.watch(getFieldPath('sortOrder')) ?? 0;
  const featured = form.watch(getFieldPath(featuredField)) ?? false;
  const scheduledFor = form.watch(getFieldPath('scheduledFor')) || '';

  return (
    <FieldSet className={className}>
      <FieldLegend className="admin-form-section-title">{title}</FieldLegend>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor={getFieldPath('status')}>Status</FieldLabel>
          <FieldContent>
            <Select
              value={status as string}
              onValueChange={(value) =>
                form.setValue(getFieldPath('status'), value as T[Path<T>])
              }
            >
              <SelectTrigger id={getFieldPath('status')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        {showFeatured && (
          <Field>
            <div className="flex items-center justify-between">
              <div>
                <FieldLabel htmlFor={getFieldPath(featuredField)}>
                  Utvald
                </FieldLabel>
                <FieldDescription>
                  Visa detta innehåll på framträdande platser.
                </FieldDescription>
              </div>
              <Switch
                id={getFieldPath(featuredField)}
                checked={featured as boolean}
                onCheckedChange={(checked) =>
                  form.setValue(
                    getFieldPath(featuredField),
                    checked as T[Path<T>]
                  )
                }
              />
            </div>
          </Field>
        )}

        {showSortOrder && (
          <Field>
            <FieldLabel htmlFor={getFieldPath('sortOrder')}>
              Sorteringsordning
            </FieldLabel>
            <FieldContent>
              <Input
                id={getFieldPath('sortOrder')}
                type="number"
                value={sortOrder as number}
                onChange={(e) =>
                  form.setValue(
                    getFieldPath('sortOrder'),
                    parseInt(e.target.value, 10) as T[Path<T>]
                  )
                }
              />
              <FieldDescription>
                Lägre nummer visas först. Standard är 0.
              </FieldDescription>
            </FieldContent>
          </Field>
        )}

        {showScheduling && (
          <Field>
            <FieldLabel htmlFor={getFieldPath('scheduledFor')}>
              Schemalägg publicering
            </FieldLabel>
            <FieldContent>
              <Input
                id={getFieldPath('scheduledFor')}
                type="datetime-local"
                value={
                  scheduledFor
                    ? new Date(scheduledFor as string).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  form.setValue(
                    getFieldPath('scheduledFor'),
                    (e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null) as T[Path<T>]
                  )
                }
              />
              <FieldDescription>
                Välj datum och tid för automatisk publicering.
              </FieldDescription>
            </FieldContent>
          </Field>
        )}

        {additionalFields}
      </FieldGroup>
    </FieldSet>
  );
}
