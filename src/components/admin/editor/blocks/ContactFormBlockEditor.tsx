'use client';

import { useState, useEffect } from 'react';
import {
  ContactFormBlock,
  FormFieldConfig,
  FormFieldId,
  FormPreset,
  CategoryOption,
  CategoryMode,
} from '@/types/blocks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  X,
  Settings2,
  RotateCcw,
  FileText,
  Sliders,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FORM_PRESETS,
  FORM_PRESET_LABELS,
  FORM_FIELD_DEFAULTS,
  FORM_FIELD_ORDER,
  createBlockFromPreset,
  mergeFieldsWithPreset,
  hasCustomizedFields,
  getFieldWithDefaults,
} from '@/lib/form-presets';

interface FlatCategory {
  id: string;
  name: string;
  depth: number;
}

interface FormTemplate {
  id: string;
  name: string;
  slug: string;
  preset: string;
  fields: FormFieldConfig[];
  categoryMode: string;
  categoryLabel: string | null;
  customCategories: CategoryOption[];
  submitButtonText: string | null;
  successMessage: string | null;
  defaultTitle: string | null;
  defaultSubtitle: string | null;
}

interface ContactFormBlockEditorProps {
  block: ContactFormBlock;
  onChange: (data: Partial<ContactFormBlock>) => void;
}

export function ContactFormBlockEditor({ block, onChange }: ContactFormBlockEditorProps) {
  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [pendingPreset, setPendingPreset] = useState<FormPreset | null>(null);
  const [expandedField, setExpandedField] = useState<FormFieldId | null>(null);
  const [configMode, setConfigMode] = useState<'template' | 'custom'>(
    block.templateId ? 'template' : 'custom'
  );

  // Get current preset (default to 'contact' for backwards compatibility)
  const currentPreset = block.preset || (block.formType as FormPreset) || 'contact';
  
  // Get current fields (merge with preset defaults if not set)
  const currentFields = block.fields || mergeFieldsWithPreset(undefined, currentPreset);
  
  // Category mode
  const categoryMode = block.categoryMode || 'system';
  
  // Custom categories
  const customCategories = block.customCategories || [];

  // Fetch categories
  useEffect(() => {
    async function fetchCategories(): Promise<void> {
      try {
        const response = await fetch('/api/admin/categories?format=flat');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // Fetch templates
  useEffect(() => {
    async function fetchTemplates(): Promise<void> {
      try {
        const response = await fetch('/api/admin/form-templates?active=true');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    }
    fetchTemplates();
  }, []);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    onChange({
      templateId,
      preset: template.preset as FormPreset,
      fields: template.fields,
      categoryMode: template.categoryMode as CategoryMode,
      categoryLabel: template.categoryLabel || undefined,
      customCategories: template.customCategories,
      submitButtonText: template.submitButtonText || undefined,
      successMessage: template.successMessage || undefined,
      title: block.title || template.defaultTitle || undefined,
      subtitle: block.subtitle || template.defaultSubtitle || undefined,
    });
  };

  // Switch to custom mode
  const handleSwitchToCustom = () => {
    setConfigMode('custom');
    onChange({ templateId: undefined });
  };

  // Handle preset change
  const handlePresetChange = (preset: FormPreset) => {
    if (hasCustomizedFields(block.fields, currentPreset)) {
      setPendingPreset(preset);
      setShowResetDialog(true);
    } else {
      applyPreset(preset);
    }
  };

  // Apply preset configuration
  const applyPreset = (preset: FormPreset) => {
    const presetConfig = createBlockFromPreset(preset);
    onChange({
      ...presetConfig,
      formType: preset, // Keep for backwards compatibility
      templateId: undefined, // Clear template when changing preset
    });
    setPendingPreset(null);
  };

  // Reset to preset defaults
  const handleResetToPreset = () => {
    applyPreset(currentPreset);
  };

  // Update a specific field configuration
  const updateField = (fieldId: FormFieldId, updates: Partial<FormFieldConfig>) => {
    const newFields = currentFields.map((f) =>
      f.id === fieldId ? { ...f, ...updates } : f
    );
    onChange({ fields: newFields, templateId: undefined });
  };

  // Add custom category
  const addCustomCategory = () => {
    const newCategory: CategoryOption = {
      value: `category-${Date.now()}`,
      label: 'Ny kategori',
    };
    onChange({
      customCategories: [...customCategories, newCategory],
      templateId: undefined,
    });
  };

  // Update custom category
  const updateCustomCategory = (index: number, updates: Partial<CategoryOption>) => {
    const newCategories = customCategories.map((c, i) =>
      i === index ? { ...c, ...updates } : c
    );
    onChange({ customCategories: newCategories, templateId: undefined });
  };

  // Remove custom category
  const removeCustomCategory = (index: number) => {
    onChange({
      customCategories: customCategories.filter((_, i) => i !== index),
      templateId: undefined,
    });
  };

  const hasCustomizations = hasCustomizedFields(block.fields, currentPreset);
  const selectedTemplate = templates.find((t) => t.id === block.templateId);

  return (
    <div className="space-y-6">
      {/* Config Mode Selector */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Konfiguration</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setConfigMode('template')}
            className={cn(
              'flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors border',
              configMode === 'template'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted border-input'
            )}
          >
            <FileText className="h-4 w-4" />
            Använd mall
          </button>
          <button
            onClick={handleSwitchToCustom}
            className={cn(
              'flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors border',
              configMode === 'custom'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted border-input'
            )}
          >
            <Sliders className="h-4 w-4" />
            Anpassad
          </button>
        </div>
      </div>

      {/* Template Selector */}
      {configMode === 'template' && (
        <div className="space-y-2 p-4 rounded-lg border bg-muted/30">
          <Label>Välj formulärmall</Label>
          {loadingTemplates ? (
            <Skeleton className="h-10 w-full" />
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Inga mallar skapade ännu.{' '}
              <a href="/admin/contact/new" className="underline">
                Skapa en mall
              </a>
            </p>
          ) : (
            <Select
              value={block.templateId || '_none'}
              onValueChange={(value) => {
                if (value === '_none') {
                  handleSwitchToCustom();
                } else {
                  handleTemplateSelect(value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Välj mall..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Välj mall...</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {selectedTemplate && (
            <p className="text-xs text-muted-foreground">
              Baserad på: {FORM_PRESET_LABELS[selectedTemplate.preset as FormPreset]}
            </p>
          )}
        </div>
      )}

      {/* Title & Subtitle (always visible) */}
      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-2">
          <Label>Rubrik (valfritt)</Label>
          <Input
            value={block.title || ''}
            onChange={(e) => onChange({ title: e.target.value || undefined })}
            placeholder={selectedTemplate?.defaultTitle || FORM_PRESETS[currentPreset].title}
          />
          <p className="text-xs text-muted-foreground">
            Lämna tomt för att använda {configMode === 'template' ? 'mallens' : 'presetens'} standardrubrik
          </p>
        </div>

        <div className="space-y-2">
          <Label>Underrubrik (valfritt)</Label>
          <Input
            value={block.subtitle || ''}
            onChange={(e) => onChange({ subtitle: e.target.value || undefined })}
            placeholder={selectedTemplate?.defaultSubtitle || FORM_PRESETS[currentPreset].subtitle}
          />
        </div>
      </div>

      {/* Custom Configuration */}
      {configMode === 'custom' && (
        <>
          {/* Preset Selector */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label>Formulärtyp</Label>
              {hasCustomizations && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetToPreset}
                  className="h-7 text-xs text-muted-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Återställ
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(FORM_PRESETS) as FormPreset[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetChange(preset)}
                  className={cn(
                    'flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    currentPreset === preset
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {FORM_PRESET_LABELS[preset]}
                </button>
              ))}
            </div>
          </div>

          {/* Field Configuration */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-medium">Fält</Label>
            <div className="space-y-1">
              {FORM_FIELD_ORDER.map((fieldId) => {
                const field = currentFields.find((f) => f.id === fieldId);
                if (!field) return null;

                const defaults = FORM_FIELD_DEFAULTS[fieldId];
                const fieldWithDefaults = getFieldWithDefaults(field);
                const isExpanded = expandedField === fieldId;

                return (
                  <Collapsible
                    key={fieldId}
                    open={isExpanded}
                    onOpenChange={(open) => setExpandedField(open ? fieldId : null)}
                  >
                    <div
                      className={cn(
                        'rounded-md border transition-colors',
                        field.enabled ? 'bg-background' : 'bg-muted/50'
                      )}
                    >
                      {/* Field Header */}
                      <div className="flex items-center gap-2 px-3 py-2">
                        <Checkbox
                          checked={field.enabled}
                          onCheckedChange={(checked) =>
                            updateField(fieldId, { enabled: checked === true })
                          }
                        />
                        <span
                          className={cn(
                            'flex-1 text-sm',
                            !field.enabled && 'text-muted-foreground'
                          )}
                        >
                          {fieldWithDefaults.label}
                        </span>
                        {field.enabled && (
                          <>
                            <Badge
                              variant={field.required ? 'default' : 'secondary'}
                              className="text-[10px] cursor-pointer"
                              onClick={() => updateField(fieldId, { required: !field.required })}
                            >
                              {field.required ? 'Obligatorisk' : 'Valfritt'}
                            </Badge>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Settings2 className="h-3.5 w-3.5" />
                              </Button>
                            </CollapsibleTrigger>
                          </>
                        )}
                      </div>

                      {/* Expanded Field Settings */}
                      <CollapsibleContent>
                        <div className="px-3 pb-3 pt-1 space-y-3 border-t">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Etikett</Label>
                            <Input
                              value={field.label || ''}
                              onChange={(e) =>
                                updateField(fieldId, {
                                  label: e.target.value || undefined,
                                })
                              }
                              placeholder={defaults.label}
                              className="h-8 text-sm"
                            />
                          </div>
                          {fieldId !== 'marketingConsent' && (
                            <div className="space-y-1.5">
                              <Label className="text-xs">Placeholder</Label>
                              <Input
                                value={field.placeholder || ''}
                                onChange={(e) =>
                                  updateField(fieldId, {
                                    placeholder: e.target.value || undefined,
                                  })
                                }
                                placeholder={defaults.placeholder}
                                className="h-8 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </div>

          {/* Category Configuration */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-medium">Kategori-dropdown</Label>
            
            <div className="space-y-2">
              <Select
                value={categoryMode}
                onValueChange={(value) => onChange({ categoryMode: value as CategoryMode, templateId: undefined })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">Systemkategorier</SelectItem>
                  <SelectItem value="custom">Anpassade val</SelectItem>
                  <SelectItem value="hidden">Dölj</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {categoryMode === 'system' && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Förval (valfritt)</Label>
                <Select
                  value={block.categoryId || '_none'}
                  onValueChange={(value) =>
                    onChange({ categoryId: value === '_none' ? undefined : value, templateId: undefined })
                  }
                  disabled={loadingCategories}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Inget förval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Inget förval</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {'—'.repeat(cat.depth)} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {categoryMode === 'custom' && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Anpassade kategorival</Label>
                <div className="space-y-2">
                  {customCategories.map((category, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={category.label}
                        onChange={(e) =>
                          updateCustomCategory(index, {
                            label: e.target.value,
                            value: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                          })
                        }
                        placeholder="Kategorinamn"
                        className="h-8 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomCategory(index)}
                        className="h-8 w-8 p-0 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCustomCategory}
                    className="w-full h-8 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Lägg till kategori
                  </Button>
                </div>
              </div>
            )}

            {categoryMode !== 'hidden' && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Dropdown-etikett</Label>
                <Input
                  value={block.categoryLabel || ''}
                  onChange={(e) => onChange({ categoryLabel: e.target.value || undefined, templateId: undefined })}
                  placeholder={FORM_FIELD_DEFAULTS.category.label}
                  className="h-8 text-sm"
                />
              </div>
            )}
          </div>

          {/* Button & Success */}
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Knapptext</Label>
              <Input
                value={block.submitButtonText || ''}
                onChange={(e) => onChange({ submitButtonText: e.target.value || undefined, templateId: undefined })}
                placeholder={FORM_PRESETS[currentPreset].submitButtonText}
              />
            </div>

            <div className="space-y-2">
              <Label>Meddelande vid lyckad insändning</Label>
              <Textarea
                value={block.successMessage || ''}
                onChange={(e) => onChange({ successMessage: e.target.value || undefined, templateId: undefined })}
                placeholder={FORM_PRESETS[currentPreset].successMessage}
                rows={2}
              />
            </div>
          </div>
        </>
      )}

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Byta formulärtyp?</AlertDialogTitle>
            <AlertDialogDescription>
              Du har gjort anpassningar till det nuvarande formuläret. Vill du
              behålla dina ändringar eller återställa till standardinställningarna
              för {pendingPreset ? FORM_PRESET_LABELS[pendingPreset] : ''}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingPreset(null)}>
              Avbryt
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
              onClick={() => {
                if (pendingPreset) {
                  // Keep customizations but change preset
                  onChange({ preset: pendingPreset, formType: pendingPreset });
                }
                setShowResetDialog(false);
                setPendingPreset(null);
              }}
            >
              Behåll ändringar
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => {
                if (pendingPreset) {
                  applyPreset(pendingPreset);
                }
                setShowResetDialog(false);
              }}
            >
              Återställ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
