'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { productSchema, type ProductFormData } from '@/schemas/product';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { parseBlocks, blocksToJSON } from '@/lib/block-validation';
import { slugify } from '@/lib/slugify';
import { BlockEditor } from '../editor/BlockEditor';
import { ImagePicker } from '../media/ImagePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Trash2 } from 'lucide-react';

interface FlatCategory {
  id: string;
  name: string;
  depth: number;
}

interface ProductFormProps {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    categoryId: string | null;
    sku: string | null;
    image: string | null;
    imageAlt: string | null;
    gallery: unknown;
    price: number | null;
    comparePrice: number | null;
    costPrice: number | null;
    vatRate: number;
    vatIncluded: boolean;
    b2bPrice: number | null;
    b2bMinQuantity: number | null;
    trackStock: boolean;
    stockQuantity: number;
    lowStockThreshold: number;
    allowBackorder: boolean;
    backorderLeadDays: number | null;
    minQuantity: number;
    maxQuantity: number | null;
    quantityStep: number;
    shortDescription: string;
    contentBlocks: unknown;
    specifications: unknown;
    metaTitle: string | null;
    metaDescription: string | null;
    ogImage: string | null;
    canonicalUrl: string | null;
    status: string;
    publishedAt: string | null;
    sortOrder: number;
    featured: boolean;
    newArrival: boolean;
    newArrivalUntil: string | null;
  } | null;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoGeneratingSlug, setAutoGeneratingSlug] = useState(false);
  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch available categories
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

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          categoryId: initialData.categoryId || null,
          sku: initialData.sku || null,
          image: initialData.image || null,
          imageAlt: initialData.imageAlt || null,
          gallery: Array.isArray(initialData.gallery) ? initialData.gallery : [],
          price: initialData.price || null,
          comparePrice: initialData.comparePrice || null,
          costPrice: initialData.costPrice || null,
          vatRate: initialData.vatRate,
          vatIncluded: initialData.vatIncluded,
          b2bPrice: initialData.b2bPrice || null,
          b2bMinQuantity: initialData.b2bMinQuantity || null,
          trackStock: initialData.trackStock,
          stockQuantity: initialData.stockQuantity,
          lowStockThreshold: initialData.lowStockThreshold,
          allowBackorder: initialData.allowBackorder,
          backorderLeadDays: initialData.backorderLeadDays || null,
          minQuantity: initialData.minQuantity,
          maxQuantity: initialData.maxQuantity || null,
          quantityStep: initialData.quantityStep,
          shortDescription: initialData.shortDescription,
          contentBlocks: parseBlocks(initialData.contentBlocks),
          specifications: Array.isArray(initialData.specifications)
            ? initialData.specifications
            : [],
          metaTitle: initialData.metaTitle || null,
          metaDescription: initialData.metaDescription || null,
          ogImage: initialData.ogImage || null,
          canonicalUrl: initialData.canonicalUrl || null,
          status: initialData.status as any,
          publishedAt: initialData.publishedAt || null,
          sortOrder: initialData.sortOrder,
          featured: initialData.featured,
          newArrival: initialData.newArrival,
          newArrivalUntil: initialData.newArrivalUntil || null,
        }
      : {
          name: '',
          slug: '',
          categoryId: null,
          sku: null,
          image: null,
          imageAlt: null,
          gallery: [],
          price: null,
          comparePrice: null,
          costPrice: null,
          vatRate: 25,
          vatIncluded: true,
          b2bPrice: null,
          b2bMinQuantity: null,
          trackStock: true,
          stockQuantity: 0,
          lowStockThreshold: 5,
          allowBackorder: false,
          backorderLeadDays: null,
          minQuantity: 1,
          maxQuantity: null,
          quantityStep: 1,
          shortDescription: '',
          contentBlocks: [],
          specifications: [],
          metaTitle: null,
          metaDescription: null,
          ogImage: null,
          canonicalUrl: null,
          status: 'draft',
          publishedAt: null,
          sortOrder: 0,
          featured: false,
          newArrival: false,
          newArrivalUntil: null,
        },
  });

  const isDirty = form.formState.isDirty;
  useUnsavedChanges(isDirty);

  // Auto-generate slug from name
  const name = form.watch('name');
  useEffect(() => {
    if (!autoGeneratingSlug && !initialData && name) {
      const generatedSlug = slugify(name);
      if (generatedSlug && !form.formState.dirtyFields.slug) {
        form.setValue('slug', generatedSlug, { shouldDirty: false });
      }
    }
  }, [name, autoGeneratingSlug, initialData, form]);

  // Auto-save draft
  useAutoSave({
    data: form.watch(),
    onSave: async (data) => {
      if (initialData?.id) {
        const response = await fetch(`/api/admin/products/${initialData.id}/draft`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            contentBlocks: blocksToJSON(data.contentBlocks),
          }),
        });
        if (!response.ok) {
          throw new Error('Auto-save failed');
        }
      }
    },
    enabled: isDirty && initialData?.status === 'draft',
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);

    try {
      const url = initialData?.id
        ? `/api/admin/products/${initialData.id}`
        : '/api/admin/products';

      const response = await fetch(url, {
        method: initialData?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          contentBlocks: blocksToJSON(data.contentBlocks),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      toast.success('Produkten har sparats');
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kunde inte spara produkten');
    } finally {
      setIsSubmitting(false);
    }
  };

  const specifications = form.watch('specifications');
  const updateSpec = (index: number, data: Partial<ProductFormData['specifications'][0]>) => {
    const newSpecs = [...specifications];
    newSpecs[index] = { ...newSpecs[index], ...data };
    form.setValue('specifications', newSpecs);
  };

  const addSpec = () => {
    form.setValue('specifications', [...specifications, { label: '', value: '' }]);
  };

  const removeSpec = (index: number) => {
    form.setValue('specifications', specifications.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="admin-form">
      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content">Innehåll</TabsTrigger>
          <TabsTrigger value="pricing">Priser</TabsTrigger>
          <TabsTrigger value="stock">Lager</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="publishing">Publicering</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Namn *</FieldLabel>
                <FieldContent>
                  <Input
                    id="name"
                    {...form.register('name')}
                    aria-invalid={!!form.formState.errors.name}
                  />
                  <FieldError errors={[form.formState.errors.name]} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="slug">Slug *</FieldLabel>
                <FieldContent>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      {...form.register('slug')}
                      aria-invalid={!!form.formState.errors.slug}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setAutoGeneratingSlug(true);
                        const generated = slugify(form.getValues('name'));
                        form.setValue('slug', generated);
                        setAutoGeneratingSlug(false);
                      }}
                    >
                      Generera
                    </Button>
                  </div>
                  <FieldError errors={[form.formState.errors.slug]} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="categoryId">Kategori</FieldLabel>
                <FieldContent>
                  <Select
                    value={form.watch('categoryId') || '_none'}
                    onValueChange={(value) => form.setValue('categoryId', value === '_none' ? null : value)}
                    disabled={loadingCategories}
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Välj kategori..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">(Ingen kategori)</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {'—'.repeat(cat.depth)} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Valfritt. Kategoriserar produkten.
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="sku">SKU</FieldLabel>
                <FieldContent>
                  <Input id="sku" {...form.register('sku')} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="shortDescription">Kort beskrivning *</FieldLabel>
                <FieldContent>
                  <Textarea
                    id="shortDescription"
                    {...form.register('shortDescription')}
                    rows={3}
                    aria-invalid={!!form.formState.errors.shortDescription}
                  />
                  <FieldError errors={[form.formState.errors.shortDescription]} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>Huvudbild</FieldLabel>
                <FieldContent>
                  <ImagePicker
                    value={form.watch('image')}
                    onChange={(url) => form.setValue('image', url)}
                  />
                  {form.watch('image') && (
                    <Input
                      {...form.register('imageAlt')}
                      placeholder="Alt-text för bilden"
                      className="mt-2"
                    />
                  )}
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Innehållsblock</FieldLegend>
            <FieldGroup>
              <Field>
                <FieldContent>
                  <BlockEditor
                    blocks={form.watch('contentBlocks')}
                    onChange={(blocks) => form.setValue('contentBlocks', blocks)}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Specifikationer</FieldLegend>
            <FieldGroup>
              <div className="space-y-4">
                {specifications.map((spec, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Specifikation {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSpec(index)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel className="text-xs">Etikett</FieldLabel>
                        <FieldContent>
                          <Input
                            value={spec.label}
                            onChange={(e) => updateSpec(index, { label: e.target.value })}
                            placeholder="Vikt"
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel className="text-xs">Värde</FieldLabel>
                        <FieldContent>
                          <Input
                            value={spec.value}
                            onChange={(e) => updateSpec(index, { value: e.target.value })}
                            placeholder="2.5 kg"
                          />
                        </FieldContent>
                      </Field>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addSpec}>
                  <Plus className="h-4 w-4 mr-1" />
                  Lägg till specifikation
                </Button>
              </div>
            </FieldGroup>
          </FieldSet>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="price">Pris (SEK)</FieldLabel>
                <FieldContent>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...form.register('price', { valueAsNumber: true })}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="comparePrice">Jämförpris (SEK)</FieldLabel>
                <FieldContent>
                  <Input
                    id="comparePrice"
                    type="number"
                    step="0.01"
                    {...form.register('comparePrice', { valueAsNumber: true })}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="vatRate">Moms (%)</FieldLabel>
                <FieldContent>
                  <Input
                    id="vatRate"
                    type="number"
                    step="0.01"
                    {...form.register('vatRate', { valueAsNumber: true })}
                  />
                </FieldContent>
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="vatIncluded">Moms inkluderad</FieldLabel>
                  <Switch
                    id="vatIncluded"
                    checked={form.watch('vatIncluded')}
                    onCheckedChange={(checked) => form.setValue('vatIncluded', checked)}
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="b2bPrice">B2B-pris (SEK)</FieldLabel>
                <FieldContent>
                  <Input
                    id="b2bPrice"
                    type="number"
                    step="0.01"
                    {...form.register('b2bPrice', { valueAsNumber: true })}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="b2bMinQuantity">Min kvantitet för B2B-pris</FieldLabel>
                <FieldContent>
                  <Input
                    id="b2bMinQuantity"
                    type="number"
                    {...form.register('b2bMinQuantity', { valueAsNumber: true })}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
        </TabsContent>

        <TabsContent value="stock" className="space-y-6">
          <FieldSet>
            <FieldGroup>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="trackStock">Spåra lager</FieldLabel>
                  <Switch
                    id="trackStock"
                    checked={form.watch('trackStock')}
                    onCheckedChange={(checked) => form.setValue('trackStock', checked)}
                  />
                </div>
              </Field>

              {form.watch('trackStock') && (
                <>
                  <Field>
                    <FieldLabel htmlFor="stockQuantity">Lagersaldo</FieldLabel>
                    <FieldContent>
                      <Input
                        id="stockQuantity"
                        type="number"
                        {...form.register('stockQuantity', { valueAsNumber: true })}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="lowStockThreshold">Låg lagernivå</FieldLabel>
                    <FieldContent>
                      <Input
                        id="lowStockThreshold"
                        type="number"
                        {...form.register('lowStockThreshold', { valueAsNumber: true })}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="allowBackorder">Tillåt restorder</FieldLabel>
                      <Switch
                        id="allowBackorder"
                        checked={form.watch('allowBackorder')}
                        onCheckedChange={(checked) => form.setValue('allowBackorder', checked)}
                      />
                    </div>
                  </Field>

                  {form.watch('allowBackorder') && (
                    <Field>
                      <FieldLabel htmlFor="backorderLeadDays">Leveranstid (dagar)</FieldLabel>
                      <FieldContent>
                        <Input
                          id="backorderLeadDays"
                          type="number"
                          {...form.register('backorderLeadDays', { valueAsNumber: true })}
                        />
                      </FieldContent>
                    </Field>
                  )}
                </>
              )}

              <Field>
                <FieldLabel htmlFor="minQuantity">Min kvantitet</FieldLabel>
                <FieldContent>
                  <Input
                    id="minQuantity"
                    type="number"
                    {...form.register('minQuantity', { valueAsNumber: true })}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="maxQuantity">Max kvantitet</FieldLabel>
                <FieldContent>
                  <Input
                    id="maxQuantity"
                    type="number"
                    {...form.register('maxQuantity', { valueAsNumber: true })}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="quantityStep">Kvantitetssteg</FieldLabel>
                <FieldContent>
                  <Input
                    id="quantityStep"
                    type="number"
                    {...form.register('quantityStep', { valueAsNumber: true })}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="metaTitle">Meta-titel</FieldLabel>
                <FieldContent>
                  <Input id="metaTitle" {...form.register('metaTitle')} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="metaDescription">Meta-beskrivning</FieldLabel>
                <FieldContent>
                  <Textarea
                    id="metaDescription"
                    {...form.register('metaDescription')}
                    rows={3}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>OG-bild</FieldLabel>
                <FieldContent>
                  <ImagePicker
                    value={form.watch('ogImage')}
                    onChange={(url) => form.setValue('ogImage', url)}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="canonicalUrl">Canonical URL</FieldLabel>
                <FieldContent>
                  <Input id="canonicalUrl" {...form.register('canonicalUrl')} />
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
        </TabsContent>

        <TabsContent value="publishing" className="space-y-6">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <FieldContent>
                  <Select
                    value={form.watch('status')}
                    onValueChange={(value) => form.setValue('status', value as any)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Utkast</SelectItem>
                      <SelectItem value="published">Publicerad</SelectItem>
                      <SelectItem value="archived">Arkiverad</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="featured">Utvald</FieldLabel>
                  <Switch
                    id="featured"
                    checked={form.watch('featured')}
                    onCheckedChange={(checked) => form.setValue('featured', checked)}
                  />
                </div>
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="newArrival">Nyhet</FieldLabel>
                  <Switch
                    id="newArrival"
                    checked={form.watch('newArrival')}
                    onCheckedChange={(checked) => form.setValue('newArrival', checked)}
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="sortOrder">Sorteringsordning</FieldLabel>
                <FieldContent>
                  <Input
                    id="sortOrder"
                    type="number"
                    {...form.register('sortOrder', { valueAsNumber: true })}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
        >
          Avbryt
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sparar...' : 'Spara'}
        </Button>
      </div>
    </form>
  );
}
