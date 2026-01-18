'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { postSchema, type PostFormData } from '@/schemas/post';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { parseBlocks, blocksToJSON } from '@/lib/block-validation';
import { slugify } from '@/lib/slugify';
import { ContentEditorHeader } from '../ContentEditorHeader';
import { SimplifiedBlockEditor } from '../SimplifiedBlockEditor';
import { ImagePicker } from '../media/ImagePicker';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface PostFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    featuredImageAlt: string | null;
    contentBlocks: unknown;
    showToc?: boolean;
    categoryId: string | null;
    tagIds?: string[];
    relatedServiceId: string | null;
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
    scheduledFor: string | null;
    authorId: string | null;
  } | null;
}

interface PostCategory {
  id: string;
  name: string;
  slug: string;
}

interface Service {
  id: string;
  title: string;
  slug: string;
}

export function PostForm({ initialData }: PostFormProps): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [seoOpen, setSeoOpen] = useState(false);
  const previewWindowRef = useRef<Window | null>(null);

  // Fetch categories and services
  useEffect(() => {
    async function fetchData(): Promise<void> {
      try {
        // Fetch post categories
        const catResponse = await fetch('/api/admin/posts/categories');
        if (catResponse.ok) {
          const catData = await catResponse.json();
          setCategories(catData);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoadingCategories(false);
      }

      try {
        // Fetch services for related service dropdown
        const svcResponse = await fetch('/api/admin/services?status=published&limit=100');
        if (svcResponse.ok) {
          const svcData = await svcResponse.json();
          setServices(svcData.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
      } finally {
        setLoadingServices(false);
      }
    }
    fetchData();
  }, []);

  const form = useForm<PostFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(postSchema) as any,
    defaultValues: initialData
      ? {
          title: initialData.title,
          slug: initialData.slug,
          excerpt: initialData.excerpt || null,
          featuredImage: initialData.featuredImage || null,
          featuredImageAlt: initialData.featuredImageAlt || null,
          contentBlocks: parseBlocks(initialData.contentBlocks),
          showToc: initialData.showToc ?? true,
          categoryId: initialData.categoryId || null,
          tagIds: initialData.tagIds || [],
          relatedServiceId: initialData.relatedServiceId || null,
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
          scheduledFor: initialData.scheduledFor || null,
          authorId: initialData.authorId || null,
        }
      : {
          title: '',
          slug: '',
          excerpt: null,
          featuredImage: null,
          featuredImageAlt: null,
          contentBlocks: [],
          showToc: true,
          categoryId: null,
          tagIds: [],
          relatedServiceId: null,
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
          scheduledFor: null,
          authorId: null,
        },
  });

  const slug = form.watch('slug');
  const previewPath = slug ? `/blogg/${slug}` : null;

  const handlePreview = (): void => {
    if (previewPath) {
      previewWindowRef.current = window.open(previewPath, 'post-preview');
    }
  };

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

  // Auto-save draft
  useAutoSave({
    data: form.watch(),
    onSave: async (data) => {
      if (initialData?.id) {
        const response = await fetch(`/api/admin/posts/${initialData.id}/draft`, {
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

  const onSubmit = async (data: PostFormData): Promise<void> => {
    setIsSubmitting(true);

    try {
      const url = initialData?.id
        ? `/api/admin/posts/${initialData.id}`
        : '/api/admin/posts';

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

      toast.success('Inlägget har sparats');

      // Reload the preview window if it's open
      if (previewWindowRef.current && !previewWindowRef.current.closed) {
        previewWindowRef.current.location.reload();
      }

      router.push('/admin/posts');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kunde inte spara inlägget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="admin-form">
      <ContentEditorHeader
        title={form.watch('title') || 'Nytt inlägg'}
        status={currentStatus as 'draft' | 'published' | 'archived'}
        onStatusChange={handleStatusChange}
        onPreview={handlePreview}
        previewUrl={previewPath}
        onSave={form.handleSubmit(onSubmit)}
        isSaving={isSubmitting}
        isDirty={isDirty}
        lastSaved={lastSaved}
        backHref="/admin/posts"
        backLabel="Tillbaka till inlägg"
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Main content area - 2/3 width */}
        <div className="col-span-2 space-y-6">
          {/* Title and Slug */}
          <FieldSet>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="title">Titel *</FieldLabel>
                <FieldContent>
                  <Input
                    id="title"
                    {...form.register('title')}
                    aria-invalid={!!form.formState.errors.title}
                    className="text-lg"
                  />
                  <FieldError errors={[form.formState.errors.title]} />
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
                        const generated = slugify(form.getValues('title'));
                        form.setValue('slug', generated);
                      }}
                    >
                      Generera
                    </Button>
                  </div>
                  <FieldError errors={[form.formState.errors.slug]} />
                  {previewPath && (
                    <p className="text-sm text-muted-foreground mt-1">
                      URL: <code className="bg-muted px-1.5 py-0.5 rounded">{previewPath}</code>
                    </p>
                  )}
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="excerpt">Utdrag</FieldLabel>
                <FieldContent>
                  <Textarea
                    id="excerpt"
                    {...form.register('excerpt')}
                    rows={3}
                    placeholder="Kort sammanfattning av inlägget..."
                  />
                  <FieldDescription>
                    Visas i blogglistan och på sociala medier om meta-beskrivning saknas.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>

          <Separator />

          {/* Main Content */}
          <FieldSet>
            <FieldLegend className="admin-form-section-title">Innehåll</FieldLegend>
            <FieldGroup>
              <Field>
                <FieldContent>
                  <SimplifiedBlockEditor
                    blocks={form.watch('contentBlocks')}
                    onChange={(blocks) => form.setValue('contentBlocks', blocks)}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>

          {/* SEO Section */}
          <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="text-lg font-semibold">SEO-inställningar</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${seoOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <FieldSet className="mt-4">
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
                      <Input
                        id="canonicalUrl"
                        {...form.register('canonicalUrl')}
                        placeholder="https://example.com/page"
                      />
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </CollapsibleContent>
          </Collapsible>

          {/* Advanced Settings */}
          <AdvancedSettingsSection
            form={form}
            contentTypeName="inlägget"
            showFeatured
            showPasswordProtection
            showRedirectOnDelete
            showIndexing
            showSitemap
            showLanguage
            defaultCollapsed
          />
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Featured Image */}
          <FieldSet>
            <FieldLegend className="text-base font-semibold mb-3">Utvald bild</FieldLegend>
            <FieldGroup>
              <Field>
                <FieldContent>
                  <ImagePicker
                    value={form.watch('featuredImage')}
                    onChange={(url) => form.setValue('featuredImage', url)}
                  />
                  {form.watch('featuredImage') && (
                    <Input
                      {...form.register('featuredImageAlt')}
                      placeholder="Alt-text för bilden"
                      className="mt-2"
                    />
                  )}
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>

          {/* Display Options */}
          <FieldSet>
            <FieldLegend className="text-base font-semibold mb-3">Visningsalternativ</FieldLegend>
            <FieldGroup>
              <Field>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <FieldLabel htmlFor="showToc">Visa innehållsförteckning</FieldLabel>
                    <FieldDescription className="text-xs">
                      Genereras automatiskt från H2/H3-rubriker
                    </FieldDescription>
                  </div>
                  <Switch
                    id="showToc"
                    checked={form.watch('showToc')}
                    onCheckedChange={(checked) => form.setValue('showToc', checked)}
                  />
                </div>
              </Field>
            </FieldGroup>
          </FieldSet>

          {/* Taxonomy */}
          <FieldSet>
            <FieldLegend className="text-base font-semibold mb-3">Kategorisering</FieldLegend>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="categoryId">Kategori</FieldLabel>
                <FieldContent>
                  <Select
                    value={form.watch('categoryId') || '_none'}
                    onValueChange={(value) => form.setValue('categoryId', value === '_none' ? null : value)}
                    disabled={loadingCategories}
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Ingen kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Ingen kategori</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="relatedServiceId">Relaterad tjänst</FieldLabel>
                <FieldContent>
                  <Select
                    value={form.watch('relatedServiceId') || '_none'}
                    onValueChange={(value) => form.setValue('relatedServiceId', value === '_none' ? null : value)}
                    disabled={loadingServices}
                  >
                    <SelectTrigger id="relatedServiceId">
                      <SelectValue placeholder="Ingen tjänst" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Ingen tjänst</SelectItem>
                      {services.map((svc) => (
                        <SelectItem key={svc.id} value={svc.id}>
                          {svc.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>Taggar</FieldLabel>
                <FieldContent>
                  <Input
                    value={form.watch('tagIds').join(', ')}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                      form.setValue('tagIds', tags);
                    }}
                    placeholder="tag1, tag2, tag3"
                  />
                  <FieldDescription className="text-xs">
                    Separera taggar med kommatecken
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/posts')}
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
