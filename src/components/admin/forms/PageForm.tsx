'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { pageSchema, type PageFormData } from '@/schemas/page';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { parseBlocks, blocksToJSON } from '@/lib/block-validation';
import { slugify } from '@/lib/slugify';
import { ContentEditorHeader } from '../ContentEditorHeader';
import { BlockEditor } from '../editor/BlockEditor';
import { AdvancedSettingsSection } from '../form-sections/AdvancedSettingsSection';
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
import { ImagePicker } from '../media/ImagePicker';
import type { FlatPageItem } from '@/lib/page-utils';

interface FlatCategory {
  id: string;
  name: string;
  depth: number;
}

interface PageFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    blocks: unknown;
    parentId: string | null;
    sortOrder: number;
    pageType: string | null;
    categoryId: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    ogImage: string | null;
    canonicalUrl: string | null;
    // Advanced settings
    noIndex?: boolean;
    noFollow?: boolean;
    excludeFromSitemap?: boolean;
    isFeatured?: boolean;
    passwordProtected?: boolean;
    password?: string | null;
    redirectOnDelete?: string | null;
    locale?: string | null;
    translationGroupId?: string | null;
    // Publishing
    status: string;
    publishedAt: string | null;
    path?: string | null;
  } | null;
}

export function PageForm({ initialData }: PageFormProps): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [parentPages, setParentPages] = useState<FlatPageItem[]>([]);
  const [loadingParents, setLoadingParents] = useState(true);
  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [existingHomePageId, setExistingHomePageId] = useState<string | null>(null);
  const previewWindowRef = useRef<Window | null>(null);

  // Fetch available parent pages
  useEffect(() => {
    async function fetchParentPages(): Promise<void> {
      try {
        const params = new URLSearchParams({ format: 'flat' });
        if (initialData?.id) {
          params.append('exclude', initialData.id);
        }
        const response = await fetch(`/api/admin/pages/hierarchy?${params}`);
        if (response.ok) {
          const data = await response.json();
          setParentPages(data);
        }
      } catch (error) {
        console.error('Failed to fetch parent pages:', error);
      } finally {
        setLoadingParents(false);
      }
    }
    fetchParentPages();
  }, [initialData?.id]);

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

  // Fetch if a homepage already exists
  useEffect(() => {
    async function fetchHomePage(): Promise<void> {
      try {
        const response = await fetch('/api/admin/pages?pageType=home&limit=1');
        if (response.ok) {
          const data = await response.json();
          if (data.pages && data.pages.length > 0) {
            setExistingHomePageId(data.pages[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to check for existing homepage:', error);
      }
    }
    fetchHomePage();
  }, []);

  const form = useForm<PageFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(pageSchema) as any,
    defaultValues: initialData
      ? {
          title: initialData.title,
          slug: initialData.slug,
          blocks: parseBlocks(initialData.blocks),
          parentId: initialData.parentId || null,
          sortOrder: initialData.sortOrder || 0,
          pageType: initialData.pageType || null,
          categoryId: initialData.categoryId || null,
          metaTitle: initialData.metaTitle || null,
          metaDescription: initialData.metaDescription || null,
          ogImage: initialData.ogImage || null,
          canonicalUrl: initialData.canonicalUrl || null,
          // Advanced settings
          noIndex: initialData.noIndex ?? false,
          noFollow: initialData.noFollow ?? false,
          excludeFromSitemap: initialData.excludeFromSitemap ?? false,
          isFeatured: initialData.isFeatured ?? false,
          passwordProtected: initialData.passwordProtected ?? false,
          password: initialData.password || null,
          redirectOnDelete: initialData.redirectOnDelete || null,
          locale: initialData.locale || null,
          translationGroupId: initialData.translationGroupId || null,
          // Publishing
          status: initialData.status as 'draft' | 'published' | 'archived',
          publishedAt: initialData.publishedAt || null,
        }
      : {
          title: '',
          slug: '',
          blocks: [],
          parentId: null,
          sortOrder: 0,
          pageType: null,
          categoryId: null,
          metaTitle: null,
          metaDescription: null,
          ogImage: null,
          canonicalUrl: null,
          // Advanced settings
          noIndex: false,
          noFollow: false,
          excludeFromSitemap: false,
          isFeatured: false,
          passwordProtected: false,
          password: null,
          redirectOnDelete: null,
          locale: null,
          translationGroupId: null,
          // Publishing
          status: 'draft',
          publishedAt: null,
        },
  });

  const isDirty = form.formState.isDirty;
  const currentStatus = form.watch('status');
  useUnsavedChanges(isDirty);

  // Auto-generate slug from title
  const title = form.watch('title');
  useEffect(() => {
    if (!initialData && title && !form.formState.dirtyFields.slug) {
      const generatedSlug = slugify(title);
      if (generatedSlug) {
        form.setValue('slug', generatedSlug, { shouldDirty: false });
      }
    }
  }, [title, initialData, form]);

  // Compute preview URL from current form values
  const slug = form.watch('slug');
  const parentId = form.watch('parentId');
  const previewUrl = useMemo(() => {
    if (!slug) return null;
    
    // Find parent path if parent is selected
    const parent = parentId ? parentPages.find(p => p.id === parentId) : null;
    if (parent?.path) {
      return `${parent.path}/${slug}`;
    }
    
    return `/${slug}`;
  }, [slug, parentId, parentPages]);

  const handlePreview = (): void => {
    if (previewUrl) {
      previewWindowRef.current = window.open(previewUrl, 'page-preview');
    }
  };

  // Auto-save draft
  useAutoSave({
    data: form.watch(),
    onSave: async (data) => {
      if (initialData?.id) {
        const response = await fetch(`/api/admin/pages/${initialData.id}/draft`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            blocks: blocksToJSON(data.blocks),
          }),
        });
        if (!response.ok) {
          throw new Error('Auto-save failed');
        }
        setLastSaved(new Date());
      }
    },
    enabled: isDirty && currentStatus === 'draft',
  });

  const handleStatusChange = (newStatus: 'draft' | 'published' | 'archived'): void => {
    form.setValue('status', newStatus);
    if (newStatus === 'published' && !form.watch('publishedAt')) {
      form.setValue('publishedAt', new Date().toISOString());
    }
  };

  const onSubmit = async (data: PageFormData): Promise<void> => {
    setIsSubmitting(true);

    try {
      const url = initialData?.id
        ? `/api/admin/pages/${initialData.id}`
        : '/api/admin/pages';

      const response = await fetch(url, {
        method: initialData?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          blocks: blocksToJSON(data.blocks),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      const result = await response.json();
      toast.success('Sidan har sparats');

      // Reload the preview window if it's open
      if (previewWindowRef.current && !previewWindowRef.current.closed) {
        previewWindowRef.current.location.reload();
      }

      // For new pages, navigate to edit page; for existing, reload current page
      if (!initialData?.id && result.id) {
        router.push(`/admin/pages/${result.id}`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kunde inte spara sidan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="admin-form">
      <ContentEditorHeader
        title={form.watch('title') || 'Ny sida'}
        status={currentStatus as 'draft' | 'published' | 'archived'}
        onStatusChange={handleStatusChange}
        onPreview={handlePreview}
        previewUrl={previewUrl}
        onSave={form.handleSubmit(onSubmit)}
        isSaving={isSubmitting}
        isDirty={isDirty}
        lastSaved={lastSaved}
        backHref="/admin/pages"
        backLabel="Tillbaka till sidor"
      />

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
                  <FieldLabel htmlFor="title">Titel *</FieldLabel>
                  {!isEditingSlug && form.watch('pageType') !== 'home' && (
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
                    id="title"
                    {...form.register('title')}
                    aria-invalid={!!form.formState.errors.title}
                  />
                  <FieldError errors={[form.formState.errors.title]} />
                  {form.watch('pageType') === 'home' && (
                    <FieldDescription>
                      Startsidan har ingen slug - den visas på webbplatsens rot (/).
                    </FieldDescription>
                  )}
                </FieldContent>
              </Field>

              {isEditingSlug && form.watch('pageType') !== 'home' && (
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
                            const generated = slugify(form.getValues('title'));
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
            </FieldGroup>
          </FieldSet>

          <Separator />

          <FieldSet>
            <FieldLegend className="admin-form-section-title">Block</FieldLegend>
            <FieldGroup className="gap-4">
              <Field>
                <FieldContent>
                  <BlockEditor
                    blocks={form.watch('blocks')}
                    onChange={(blocks) => form.setValue('blocks', blocks)}
                  />
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
                  <FieldLabel htmlFor="parentId">Föräldersida</FieldLabel>
                  <FieldContent>
                    <Select
                      value={form.watch('parentId') || '_none'}
                      onValueChange={(value) => form.setValue('parentId', value === '_none' ? null : value)}
                      disabled={loadingParents}
                    >
                      <SelectTrigger id="parentId">
                        <SelectValue placeholder="(Ingen förälder)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">(Ingen förälder)</SelectItem>
                        {parentPages.map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            {'—'.repeat(page.depth)} {page.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Välj en föräldersida för att skapa en undersida. Sidans URL kommer ärvas från föräldern.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend className="text-base font-semibold mb-4">Sidtyp</FieldLegend>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="pageType">Sidtyp</FieldLabel>
                  <FieldContent>
                    <Select
                      value={form.watch('pageType') || '_none'}
                      onValueChange={(value) => {
                        form.setValue('pageType', value === '_none' ? null : value);
                        // Clear slug for homepage
                        if (value === 'home') {
                          form.setValue('slug', '');
                          setIsEditingSlug(false);
                        }
                      }}
                    >
                      <SelectTrigger id="pageType">
                        <SelectValue placeholder="Standard" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">Standard</SelectItem>
                        <SelectItem 
                          value="home" 
                          disabled={existingHomePageId !== null && existingHomePageId !== initialData?.id}
                        >
                          Startsida {existingHomePageId && existingHomePageId !== initialData?.id && '(redan vald)'}
                        </SelectItem>
                        <SelectItem value="category_landing">Kategorilandningssida</SelectItem>
                        <SelectItem value="category_section">Kategorisektion</SelectItem>
                        <SelectItem value="category_sub">Underkategori</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Standard för vanliga sidor. Startsidan visas på / och kan endast finnas en gång.
                    </FieldDescription>
                  </FieldContent>
                </Field>

                {['category_landing', 'category_section', 'category_sub'].includes(form.watch('pageType') || '') && (
                  <Field>
                    <FieldLabel htmlFor="categoryId">Tjänstkategori</FieldLabel>
                    <FieldContent>
                      <Select
                        value={form.watch('categoryId') || '_none'}
                        onValueChange={(value) => form.setValue('categoryId', value === '_none' ? null : value)}
                        disabled={loadingCategories}
                      >
                        <SelectTrigger id="categoryId">
                          <SelectValue placeholder="Välj kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">Ingen</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {'—'.repeat(cat.depth)} {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>
                )}
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
                    Titeln som visas i sökmotorer och webbläsarens flik. Rekommenderat: 50-60 tecken.
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
                    Bilden som visas när sidan delas på sociala medier. Rekommenderad storlek: 1200x630px.
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="canonicalUrl">Canonical URL</FieldLabel>
                <FieldContent>
                  <Input id="canonicalUrl" {...form.register('canonicalUrl')} placeholder="https://example.com/page" />
                  <FieldDescription>
                    Använd canonical URL när du har duplicerat innehåll på flera sidor eller när sidan är en kopia av en annan sida. 
                    Detta säger till sökmotorer vilken version som är den "officiella" versionen. 
                    Lämna tomt om sidan är unik - då används sidans egen URL automatiskt.
                  </FieldDescription>
                </FieldContent>
              </Field>

            </FieldGroup>
          </FieldSet>

          <AdvancedSettingsSection
            form={form}
            contentTypeName="sidan"
            showFeatured
            showPasswordProtection
            showRedirectOnDelete
            showIndexing
            showSitemap
            showLanguage
            defaultCollapsed={false}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/pages')}
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
