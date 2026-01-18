'use client';

import { useState, useEffect } from 'react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  Globe, 
  Lock, 
  Star, 
  Search, 
  ExternalLink,
  Languages,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  isDefault: boolean;
}

interface TranslationOption {
  id: string;
  title: string;
  locale: string;
}

export interface AdvancedSettingsSectionProps<T extends FieldValues> {
  /** React Hook Form instance */
  form: UseFormReturn<T>;
  /** Field name prefix for nested forms */
  prefix?: string;
  /** Show featured/pinned toggle */
  showFeatured?: boolean;
  /** Show password protection */
  showPasswordProtection?: boolean;
  /** Show redirect on delete */
  showRedirectOnDelete?: boolean;
  /** Show noindex/nofollow */
  showIndexing?: boolean;
  /** Show exclude from sitemap */
  showSitemap?: boolean;
  /** Show language selector */
  showLanguage?: boolean;
  /** Available languages */
  languages?: Language[];
  /** Existing translations to link to */
  translations?: TranslationOption[];
  /** Current content ID (for linking translations) */
  currentId?: string;
  /** Content type name for labels (e.g., "sidan", "tjänsten") */
  contentTypeName?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Additional className */
  className?: string;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

/**
 * Reusable advanced settings section for admin forms.
 * Includes SEO indexing, featured flag, password protection, language selection.
 */
export function AdvancedSettingsSection<T extends FieldValues>({
  form,
  prefix,
  showFeatured = true,
  showPasswordProtection = true,
  showRedirectOnDelete = true,
  showIndexing = true,
  showSitemap = true,
  showLanguage = true,
  languages = [],
  translations = [],
  currentId,
  contentTypeName = 'innehållet',
  title = 'Avancerade inställningar',
  description,
  className,
  defaultCollapsed = true,
}: AdvancedSettingsSectionProps<T>): React.ReactElement {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>(languages);

  // Helper to get field path with optional prefix
  const getFieldPath = (field: string): Path<T> =>
    (prefix ? `${prefix}.${field}` : field) as Path<T>;

  // Get current values
  const isFeatured = form.watch(getFieldPath('isFeatured')) || false;
  const passwordProtected = form.watch(getFieldPath('passwordProtected')) || false;
  const noIndex = form.watch(getFieldPath('noIndex')) || false;
  const noFollow = form.watch(getFieldPath('noFollow')) || false;
  const excludeFromSitemap = form.watch(getFieldPath('excludeFromSitemap')) || false;
  const locale = form.watch(getFieldPath('locale')) || '';
  const translationGroupId = form.watch(getFieldPath('translationGroupId')) || '';
  const redirectOnDelete = form.watch(getFieldPath('redirectOnDelete')) || '';
  const password = form.watch(getFieldPath('password')) || '';

  // Fetch languages if not provided
  useEffect(() => {
    if (showLanguage && languages.length === 0) {
      setLoadingLanguages(true);
      fetch('/api/admin/languages')
        .then((res) => res.ok ? res.json() : [])
        .then((data) => setAvailableLanguages(data))
        .catch(() => setAvailableLanguages([]))
        .finally(() => setLoadingLanguages(false));
    }
  }, [showLanguage, languages.length]);

  // Get other translations in the same group
  const linkedTranslations = translations.filter(
    (t) => t.id !== currentId && translationGroupId && t.locale !== locale
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <FieldSet>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <FieldLegend className="admin-form-section-title flex items-center gap-2 cursor-pointer">
              {title}
            </FieldLegend>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </button>
        </CollapsibleTrigger>
        {description && (
          <p className="text-sm text-muted-foreground -mt-2 mb-4">{description}</p>
        )}

        <CollapsibleContent>
          <FieldGroup className="gap-6 pt-4">
            {/* Language Selection */}
            {showLanguage && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Languages className="h-4 w-4 text-primary" />
                  <span>Språk & Översättningar</span>
                </div>

                <Field>
                  <FieldLabel htmlFor={getFieldPath('locale')}>Språk</FieldLabel>
                  <FieldContent>
                    <Select
                      value={(locale as string) || '_default'}
                      onValueChange={(value) =>
                        form.setValue(
                          getFieldPath('locale'),
                          (value === '_default' ? null : value) as T[Path<T>]
                        )
                      }
                      disabled={loadingLanguages}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Välj språk..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_default">Standard (Svenska)</SelectItem>
                        {availableLanguages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.nativeName} ({lang.code.toUpperCase()})
                            {lang.isDefault && ' ★'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Vilket språk är {contentTypeName} skrivet på?
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor={getFieldPath('translationGroupId')}>
                    Översättningsgrupp
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={getFieldPath('translationGroupId')}
                      value={translationGroupId as string}
                      onChange={(e) =>
                        form.setValue(
                          getFieldPath('translationGroupId'),
                          e.target.value as T[Path<T>]
                        )
                      }
                      placeholder="Lämna tomt för automatiskt ID"
                    />
                    <FieldDescription>
                      Koppla ihop översättningar genom att ge dem samma grupp-ID.
                      Lämna tomt för att skapa ny grupp automatiskt.
                    </FieldDescription>
                  </FieldContent>
                </Field>

                {linkedTranslations.length > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Länkade översättningar:</span>
                    <ul className="mt-1 space-y-1">
                      {linkedTranslations.map((t) => (
                        <li key={t.id} className="flex items-center gap-2">
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {t.locale.toUpperCase()}
                          </span>
                          <span>{t.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Featured Toggle */}
            {showFeatured && (
              <Field>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <FieldLabel htmlFor={getFieldPath('isFeatured')} className="mb-0">
                      Utmärkt innehåll
                    </FieldLabel>
                  </div>
                  <Switch
                    id={getFieldPath('isFeatured')}
                    checked={isFeatured as boolean}
                    onCheckedChange={(checked) =>
                      form.setValue(getFieldPath('isFeatured'), checked as T[Path<T>])
                    }
                  />
                </div>
                <FieldDescription className="ml-6">
                  Markera som utmärkt för att visa på startsidan eller i utvalda listor.
                </FieldDescription>
              </Field>
            )}

            {/* Password Protection */}
            {showPasswordProtection && (
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                <Field>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-orange-500" />
                      <FieldLabel htmlFor={getFieldPath('passwordProtected')} className="mb-0">
                        Lösenordsskydd
                      </FieldLabel>
                    </div>
                    <Switch
                      id={getFieldPath('passwordProtected')}
                      checked={passwordProtected as boolean}
                      onCheckedChange={(checked) =>
                        form.setValue(getFieldPath('passwordProtected'), checked as T[Path<T>])
                      }
                    />
                  </div>
                  <FieldDescription className="ml-6">
                    Kräv lösenord för att visa {contentTypeName}.
                  </FieldDescription>
                </Field>

                {passwordProtected && (
                  <Field>
                    <FieldLabel htmlFor={getFieldPath('password')}>Lösenord</FieldLabel>
                    <FieldContent>
                      <Input
                        id={getFieldPath('password')}
                        type="password"
                        value={password as string}
                        onChange={(e) =>
                          form.setValue(getFieldPath('password'), e.target.value as T[Path<T>])
                        }
                        placeholder="Ange lösenord..."
                      />
                    </FieldContent>
                  </Field>
                )}
              </div>
            )}

            {/* SEO Indexing */}
            {(showIndexing || showSitemap) && (
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Search className="h-4 w-4 text-primary" />
                  <span>Sökmotorer & Indexering</span>
                </div>

                {showIndexing && (
                  <>
                    <Field>
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor={getFieldPath('noIndex')} className="mb-0">
                          Dölj från sökmotorer (noindex)
                        </FieldLabel>
                        <Switch
                          id={getFieldPath('noIndex')}
                          checked={noIndex as boolean}
                          onCheckedChange={(checked) =>
                            form.setValue(getFieldPath('noIndex'), checked as T[Path<T>])
                          }
                        />
                      </div>
                      <FieldDescription>
                        Förhindra att sökmotorer indexerar {contentTypeName}.
                      </FieldDescription>
                    </Field>

                    <Field>
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor={getFieldPath('noFollow')} className="mb-0">
                          Följ inte länkar (nofollow)
                        </FieldLabel>
                        <Switch
                          id={getFieldPath('noFollow')}
                          checked={noFollow as boolean}
                          onCheckedChange={(checked) =>
                            form.setValue(getFieldPath('noFollow'), checked as T[Path<T>])
                          }
                        />
                      </div>
                      <FieldDescription>
                        Förhindra att sökmotorer följer länkar på sidan.
                      </FieldDescription>
                    </Field>
                  </>
                )}

                {showSitemap && (
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor={getFieldPath('excludeFromSitemap')} className="mb-0">
                        Exkludera från sitemap
                      </FieldLabel>
                      <Switch
                        id={getFieldPath('excludeFromSitemap')}
                        checked={excludeFromSitemap as boolean}
                        onCheckedChange={(checked) =>
                          form.setValue(getFieldPath('excludeFromSitemap'), checked as T[Path<T>])
                        }
                      />
                    </div>
                    <FieldDescription>
                      Ta bort {contentTypeName} från XML-sitemap.
                    </FieldDescription>
                  </Field>
                )}
              </div>
            )}

            {/* Redirect on Delete */}
            {showRedirectOnDelete && (
              <Field>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                  <FieldLabel htmlFor={getFieldPath('redirectOnDelete')}>
                    Omdirigering vid borttagning
                  </FieldLabel>
                </div>
                <FieldContent>
                  <Input
                    id={getFieldPath('redirectOnDelete')}
                    value={redirectOnDelete as string}
                    onChange={(e) =>
                      form.setValue(
                        getFieldPath('redirectOnDelete'),
                        e.target.value as T[Path<T>]
                      )
                    }
                    placeholder="/alternativ-sida"
                  />
                  <FieldDescription>
                    URL att omdirigera till om {contentTypeName} tas bort.
                    Förhindrar 404-fel.
                  </FieldDescription>
                </FieldContent>
              </Field>
            )}
          </FieldGroup>
        </CollapsibleContent>
      </FieldSet>
    </Collapsible>
  );
}
