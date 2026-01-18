'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Eye, Pencil } from 'lucide-react';
import { categorySchema, type CategoryFormData } from '@/schemas/category';
import { slugify } from '@/lib/slugify';
import { ImagePicker } from '../media/ImagePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldGroup,
  FieldLegend,
  FieldDescription,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FlatCategory {
  id: string;
  name: string;
  slug: string;
  path: string;
  depth: number;
  parentId: string | null;
}

interface CategoryFormProps {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId: string | null;
    path: string;
    type: string;
    heroImage: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    ogImage: string | null;
    sortOrder: number;
    isActive: boolean;
  } | null;
}

export function CategoryForm({ initialData }: CategoryFormProps): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [parentCategories, setParentCategories] = useState<FlatCategory[]>([]);
  const [loadingParents, setLoadingParents] = useState(true);

  // Fetch available parent categories
  useEffect(() => {
    async function fetchParentCategories(): Promise<void> {
      try {
        const params = new URLSearchParams({ format: 'flat', includeInactive: 'true' });
        const response = await fetch(`/api/admin/categories?${params}`);
        if (response.ok) {
          const data = await response.json();
          // Filter out current category and its descendants to prevent circular refs
          const filtered = initialData?.id
            ? data.filter((cat: FlatCategory) => {
                // Exclude self
                if (cat.id === initialData.id) return false;
                // Exclude descendants (path starts with current category's path)
                if (cat.path.startsWith(initialData.path + '/')) return false;
                return true;
              })
            : data;
          setParentCategories(filtered);
        }
      } catch (error) {
        console.error('Failed to fetch parent categories:', error);
      } finally {
        setLoadingParents(false);
      }
    }
    fetchParentCategories();
  }, [initialData?.id, initialData?.path]);

  const form = useForm<CategoryFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(categorySchema) as any,
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          description: initialData.description || '',
          parentId: initialData.parentId,
          type: initialData.type as 'main' | 'section' | 'sub_category',
          heroImage: initialData.heroImage,
          metaTitle: initialData.metaTitle || '',
          metaDescription: initialData.metaDescription || '',
          ogImage: initialData.ogImage,
          sortOrder: initialData.sortOrder,
          isActive: initialData.isActive,
        }
      : {
          name: '',
          slug: '',
          description: '',
          parentId: null,
          type: 'main',
          heroImage: null,
          metaTitle: '',
          metaDescription: '',
          ogImage: null,
          sortOrder: 0,
          isActive: true,
        },
  });

  // Auto-generate slug from name
  const name = form.watch('name');
  useEffect(() => {
    if (!initialData && name && !form.formState.dirtyFields.slug) {
      const generatedSlug = slugify(name);
      form.setValue('slug', generatedSlug, { shouldDirty: false });
    }
  }, [name, initialData, form]);

  // Compute preview path
  const slug = form.watch('slug');
  const parentId = form.watch('parentId');
  const previewPath = useMemo(() => {
    if (!slug) return null;

    const parent = parentId ? parentCategories.find((p) => p.id === parentId) : null;
    if (parent) {
      return `${parent.path}/${slug}`;
    }

    return `/${slug}`;
  }, [slug, parentId, parentCategories]);

  const handlePreview = (): void => {
    if (previewPath) {
      window.open(previewPath, 'category-preview');
    }
  };

  const onSubmit = async (data: CategoryFormData): Promise<void> => {
    setIsSubmitting(true);

    try {
      const url = initialData?.id
        ? `/api/admin/categories/${initialData.id}`
        : '/api/admin/categories';

      const response = await fetch(url, {
        method: initialData?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      const result = await response.json();
      toast.success('Kategorin har sparats');

      if (!initialData?.id && result.id) {
        router.push(`/admin/categories/${result.id}`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kunde inte spara kategorin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="admin-form">
      {/* Header with Preview and Active status */}
      <div className="flex items-center justify-end pb-4 border-b gap-4">
        <div className="flex items-center gap-4">
          {previewPath && initialData?.id && (
            <Button type="button" variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Förhandsvisa
            </Button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Aktiv:</span>
            <Switch
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => form.setValue('isActive', checked)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content">Innehåll</TabsTrigger>
          <TabsTrigger value="settings">Inställningar</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6 mt-6">
          <FieldSet>
            <FieldGroup className="gap-4">
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="name">Namn *</FieldLabel>
                  {!isEditingSlug && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingSlug(true)}
                      className="h-7 text-xs"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Redigera slug
                    </Button>
                  )}
                </div>
                <FieldContent>
                  <Input
                    id="name"
                    {...form.register('name')}
                    aria-invalid={!!form.formState.errors.name}
                  />
                  <FieldError errors={[form.formState.errors.name]} />
                </FieldContent>
              </Field>

              {isEditingSlug && (
                <>
                  <Separator />
                  <Field>
                    <FieldLabel htmlFor="slug">Slug *</FieldLabel>
                    <FieldContent>
                      <div className="flex gap-2">
                        <Input
                          id="slug"
                          {...form.register('slug')}
                          aria-invalid={!!form.formState.errors.slug}
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const generated = slugify(form.getValues('name'));
                            form.setValue('slug', generated);
                          }}
                        >
                          Generera
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingSlug(false)}
                        >
                          Klar
                        </Button>
                      </div>
                      <FieldError errors={[form.formState.errors.slug]} />
                    </FieldContent>
                  </Field>
                </>
              )}

              {previewPath && (
                <div className="text-sm text-muted-foreground px-1">
                  URL: <code className="bg-muted px-1 py-0.5 rounded">{previewPath}</code>
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="description">Beskrivning</FieldLabel>
                <FieldContent>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    rows={3}
                    placeholder="En kort beskrivning av kategorin..."
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>

          <Separator />

          <FieldSet>
            <FieldLegend className="admin-form-section-title">Landningssida</FieldLegend>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Hero-bild</FieldLabel>
                <FieldContent>
                  <ImagePicker
                    value={form.watch('heroImage')}
                    onChange={(url) => form.setValue('heroImage', url)}
                  />
                  <FieldDescription>
                    Bilden som visas i kategorins hero-sektion.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <div className="grid gap-6">
            <FieldSet>
              <FieldLegend className="text-base font-semibold mb-4">Hierarki</FieldLegend>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="parentId">Förälderkategori</FieldLabel>
                  <FieldContent>
                    <Select
                      value={form.watch('parentId') || '_none'}
                      onValueChange={(value) =>
                        form.setValue('parentId', value === '_none' ? null : value)
                      }
                      disabled={loadingParents}
                    >
                      <SelectTrigger id="parentId">
                        <SelectValue placeholder="(Ingen förälder - rotnivå)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">(Ingen förälder - rotnivå)</SelectItem>
                        {parentCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {'—'.repeat(cat.depth)} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Välj en förälderkategori för att skapa en underkategori. URL:en byggs
                      automatiskt baserat på hierarkin.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend className="text-base font-semibold mb-4">Kategorityp</FieldLegend>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="type">Typ</FieldLabel>
                  <FieldContent>
                    <Select
                      value={form.watch('type')}
                      onValueChange={(value) =>
                        form.setValue('type', value as 'main' | 'section' | 'sub_category')
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Huvudkategori</SelectItem>
                        <SelectItem value="section">Sektion</SelectItem>
                        <SelectItem value="sub_category">Underkategori</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Huvudkategorier är toppnivån (t.ex. Brandskydd). Sektioner är
                      underavdelningar (t.ex. Tjänster). Underkategorier är för ytterligare
                      gruppering.
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="sortOrder">Sorteringsordning</FieldLabel>
                  <FieldContent>
                    <Input
                      id="sortOrder"
                      type="number"
                      {...form.register('sortOrder', { valueAsNumber: true })}
                      className="w-24"
                    />
                    <FieldDescription>
                      Lägre nummer visas först. Kategorier med samma ordning sorteras
                      alfabetiskt.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </FieldSet>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6 mt-6">
          <FieldSet>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="metaTitle">Meta-titel</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Input
                      id="metaTitle"
                      {...form.register('metaTitle')}
                      className="pr-16"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {(form.watch('metaTitle') || '').length}/60
                    </span>
                  </div>
                  <FieldDescription>
                    Titeln som visas i sökmotorer. Rekommenderat: 50-60 tecken.
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="metaDescription">Meta-beskrivning</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Textarea
                      id="metaDescription"
                      {...form.register('metaDescription')}
                      rows={3}
                      className="pr-16"
                    />
                    <span className="absolute right-3 top-2 text-xs text-muted-foreground">
                      {(form.watch('metaDescription') || '').length}/160
                    </span>
                  </div>
                  <FieldDescription>
                    Beskrivningen som visas i sökmotorer. Rekommenderat: 150-160 tecken.
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>OG-bild</FieldLabel>
                <FieldContent>
                  <ImagePicker
                    value={form.watch('ogImage')}
                    onChange={(url) => form.setValue('ogImage', url)}
                  />
                  <FieldDescription>
                    Bilden som visas när sidan delas på sociala medier. Rekommenderad storlek:
                    1200x630px.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/categories')}>
          Avbryt
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sparar...' : 'Spara'}
        </Button>
      </div>
    </form>
  );
}
