'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Save, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { ContactFormBlockEditor } from '@/components/admin/editor/blocks/ContactFormBlockEditor';
import { formTemplateSchema, type FormTemplateFormData, type FormTemplateFormInput } from '@/schemas/form-template';
import type { ContactFormBlock, FormPreset, FormFieldConfig, CategoryOption, CategoryMode } from '@/types/blocks';
import { FORM_PRESETS } from '@/lib/form-presets';
import { slugify } from '@/lib/slugify';

interface FormTemplateFormProps {
  initialData?: FormTemplateFormData & { id?: string };
  isNew?: boolean;
}

export function FormTemplateForm({ initialData, isNew = true }: FormTemplateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create a virtual ContactFormBlock for the editor
  const [formBlock, setFormBlock] = useState<ContactFormBlock>(() => {
    const preset = (initialData?.preset || 'contact') as FormPreset;
    return {
      id: 'template-form',
      type: 'contactForm',
      preset,
      fields: (initialData?.fields as FormFieldConfig[]) || FORM_PRESETS[preset].fields,
      categoryMode: (initialData?.categoryMode || 'system') as CategoryMode,
      categoryLabel: initialData?.categoryLabel || undefined,
      customCategories: (initialData?.customCategories as CategoryOption[]) || [],
      submitButtonText: initialData?.submitButtonText || undefined,
      successMessage: initialData?.successMessage || undefined,
      title: initialData?.defaultTitle || undefined,
      subtitle: initialData?.defaultSubtitle || undefined,
    };
  });

  const form = useForm<FormTemplateFormInput>({
    resolver: zodResolver(formTemplateSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      preset: initialData?.preset || 'contact',
      fields: initialData?.fields || [],
      categoryMode: initialData?.categoryMode || 'system',
      categoryLabel: initialData?.categoryLabel || null,
      customCategories: initialData?.customCategories || [],
      submitButtonText: initialData?.submitButtonText || null,
      successMessage: initialData?.successMessage || null,
      defaultTitle: initialData?.defaultTitle || null,
      defaultSubtitle: initialData?.defaultSubtitle || null,
      isActive: initialData?.isActive ?? true,
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    if (isNew && !watch('slug')) {
      setValue('slug', slugify(name));
    }
  };

  // Update form data when block editor changes
  const handleBlockChange = (updates: Partial<ContactFormBlock>) => {
    setFormBlock((prev) => ({ ...prev, ...updates }));

    // Sync to form
    if (updates.preset) setValue('preset', updates.preset);
    if (updates.fields) setValue('fields', updates.fields);
    if (updates.categoryMode) setValue('categoryMode', updates.categoryMode);
    if ('categoryLabel' in updates) setValue('categoryLabel', updates.categoryLabel || null);
    if (updates.customCategories) setValue('customCategories', updates.customCategories);
    if ('submitButtonText' in updates) setValue('submitButtonText', updates.submitButtonText || null);
    if ('successMessage' in updates) setValue('successMessage', updates.successMessage || null);
    if ('title' in updates) setValue('defaultTitle', updates.title || null);
    if ('subtitle' in updates) setValue('defaultSubtitle', updates.subtitle || null);
  };

  const onSubmit = async (data: FormTemplateFormInput) => {
    setIsSubmitting(true);

    try {
      const url = isNew
        ? '/api/admin/form-templates'
        : `/api/admin/form-templates/${initialData?.id}`;

      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Kunde inte spara mallen');
      }

      toast.success(isNew ? 'Mall skapad' : 'Mall uppdaterad');
      router.push('/admin/contact');
      router.refresh();
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error(error instanceof Error ? error.message : 'Kunde inte spara mallen');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/form-templates/${initialData.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Kunde inte ta bort mallen');
      }

      toast.success('Mall borttagen');
      router.push('/admin/contact');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Kunde inte ta bort mallen');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-form">
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">Inställningar</TabsTrigger>
          <TabsTrigger value="form">Formulär</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mallinformation</CardTitle>
              <CardDescription>
                Grundläggande information om formulärmallen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Mallnamn *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    onChange={handleNameChange}
                    placeholder="T.ex. Offertförfrågan Brandskydd"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    {...register('slug')}
                    placeholder="t.ex. offert-brandskydd"
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-500">{errors.slug.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beskrivning (admin)</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Intern beskrivning av när denna mall ska användas..."
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label>Aktiv</Label>
                  <p className="text-sm text-muted-foreground">
                    Inaktiva mallar visas inte vid val
                  </p>
                </div>
                <Switch
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Standardinnehåll</CardTitle>
              <CardDescription>
                Rubrik och underrubrik som används som standard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultTitle">Standardrubrik</Label>
                <Input
                  id="defaultTitle"
                  value={formBlock.title || ''}
                  onChange={(e) => handleBlockChange({ title: e.target.value || undefined })}
                  placeholder="T.ex. Begär offert"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultSubtitle">Standardunderrubrik</Label>
                <Input
                  id="defaultSubtitle"
                  value={formBlock.subtitle || ''}
                  onChange={(e) => handleBlockChange({ subtitle: e.target.value || undefined })}
                  placeholder="T.ex. Fyll i formuläret så återkommer vi"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Form Configuration Tab */}
        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Formulärkonfiguration</CardTitle>
              <CardDescription>
                Konfigurera fält, kategorier och knapptext
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactFormBlockEditor
                block={formBlock}
                onChange={handleBlockChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div>
          {!isNew && initialData?.id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isDeleting}>
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Ta bort
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ta bort mall?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Är du säker på att du vill ta bort denna formulärmall? Detta kan
                    inte ångras.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Ta bort
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/contact')}
          >
            Avbryt
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isNew ? 'Skapa mall' : 'Spara ändringar'}
          </Button>
        </div>
      </div>
    </form>
  );
}
