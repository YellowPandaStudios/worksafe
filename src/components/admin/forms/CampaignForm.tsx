'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { campaignSchema, type CampaignFormData } from '@/schemas/campaign';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { parseBlocks, blocksToJSON } from '@/lib/block-validation';
import { slugify } from '@/lib/slugify';
import { ContentEditorHeader } from '../ContentEditorHeader';
import { BlockEditor } from '../editor/BlockEditor';
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

interface CampaignFormProps {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    goal: string;
    blocks: unknown;
    formPosition: string;
    hideNav: boolean;
    hideFooter: boolean;
    urgencyText: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    startDate: string | null;
    endDate: string | null;
    redirectTo: string | null;
    trafficPercent: number;
    isTestActive: boolean;
    metaTitle: string | null;
    metaDescription: string | null;
    ogImage: string | null;
    noIndex: boolean;
    status: string;
  } | null;
}

export function CampaignForm({ initialData }: CampaignFormProps): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const previewWindowRef = useRef<Window | null>(null);

  const form = useForm<CampaignFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(campaignSchema) as any,
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          goal: initialData.goal as 'lead_gen' | 'awareness' | 'product_sale' | 'event_signup',
          blocks: parseBlocks(initialData.blocks),
          formPosition: initialData.formPosition as 'hero' | 'sticky' | 'bottom' | 'inline',
          hideNav: initialData.hideNav,
          hideFooter: initialData.hideFooter,
          urgencyText: initialData.urgencyText || null,
          utmSource: initialData.utmSource || null,
          utmMedium: initialData.utmMedium || null,
          utmCampaign: initialData.utmCampaign || null,
          startDate: initialData.startDate || null,
          endDate: initialData.endDate || null,
          redirectTo: initialData.redirectTo || null,
          trafficPercent: initialData.trafficPercent,
          isTestActive: initialData.isTestActive,
          metaTitle: initialData.metaTitle || null,
          metaDescription: initialData.metaDescription || null,
          ogImage: initialData.ogImage || null,
          noIndex: initialData.noIndex,
          status: initialData.status as 'draft' | 'published' | 'archived',
        }
      : {
          name: '',
          slug: '',
          goal: 'lead_gen',
          blocks: [],
          formPosition: 'hero',
          hideNav: false,
          hideFooter: false,
          urgencyText: null,
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
          startDate: null,
          endDate: null,
          redirectTo: null,
          trafficPercent: 100,
          isTestActive: false,
          metaTitle: null,
          metaDescription: null,
          ogImage: null,
          noIndex: true,
          status: 'draft',
        },
  });

  const isDirty = form.formState.isDirty;
  const currentStatus = form.watch('status');
  const slug = form.watch('slug');
  const previewUrl = slug ? `/kampanj/${slug}` : null;
  useUnsavedChanges(isDirty);

  const handlePreview = (): void => {
    if (previewUrl) {
      previewWindowRef.current = window.open(previewUrl, 'campaign-preview');
    }
  };

  // Auto-generate slug from name
  const name = form.watch('name');
  useEffect(() => {
    if (!initialData && name && !form.formState.dirtyFields.slug) {
      const generatedSlug = slugify(name);
      if (generatedSlug) {
        form.setValue('slug', generatedSlug, { shouldDirty: false });
      }
    }
  }, [name, initialData, form]);

  // Auto-save draft
  useAutoSave({
    data: form.watch(),
    onSave: async (data) => {
      if (initialData?.id) {
        const response = await fetch(`/api/admin/campaigns/${initialData.id}/draft`, {
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
  };

  const onSubmit = async (data: CampaignFormData): Promise<void> => {
    setIsSubmitting(true);

    try {
      const url = initialData?.id
        ? `/api/admin/campaigns/${initialData.id}`
        : '/api/admin/campaigns';

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

      toast.success('Kampanjen har sparats');
      
      // Reload the preview window if it's open
      if (previewWindowRef.current && !previewWindowRef.current.closed) {
        previewWindowRef.current.location.reload();
      }

      router.push('/admin/campaigns');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kunde inte spara kampanjen');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="admin-form">
      <ContentEditorHeader
        title={form.watch('name') || 'Ny kampanj'}
        status={currentStatus as 'draft' | 'published' | 'archived'}
        onStatusChange={handleStatusChange}
        onPreview={handlePreview}
        previewUrl={previewUrl}
        onSave={form.handleSubmit(onSubmit)}
        isSaving={isSubmitting}
        isDirty={isDirty}
        lastSaved={lastSaved}
        backHref="/admin/campaigns"
        backLabel="Tillbaka till kampanjer"
      />

      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content">Innehåll</TabsTrigger>
          <TabsTrigger value="settings">Inställningar</TabsTrigger>
          <TabsTrigger value="tracking">Spårning</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6 mt-6">
          <FieldSet>
            <FieldGroup className="gap-4">
              <div className="grid grid-cols-2 gap-4">
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
                          const generated = slugify(form.getValues('name'));
                          form.setValue('slug', generated);
                        }}
                      >
                        Generera
                      </Button>
                    </div>
                    <FieldError errors={[form.formState.errors.slug]} />
                  </FieldContent>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="goal">Mål *</FieldLabel>
                <FieldContent>
                  <Select
                    value={form.watch('goal')}
                    onValueChange={(value) => form.setValue('goal', value as 'lead_gen' | 'awareness' | 'product_sale' | 'event_signup')}
                  >
                    <SelectTrigger id="goal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead_gen">Leadgenerering</SelectItem>
                      <SelectItem value="awareness">Medvetenhet</SelectItem>
                      <SelectItem value="product_sale">Produktförsäljning</SelectItem>
                      <SelectItem value="event_signup">Evenemangsregistrering</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>

          <Separator />

          <FieldSet>
            <FieldLegend className="admin-form-section-title">Block</FieldLegend>
            <FieldGroup>
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
          <FieldSet>
            <FieldLegend className="text-base font-semibold mb-4">Layout</FieldLegend>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="formPosition">Formulärposition</FieldLabel>
                <FieldContent>
                  <Select
                    value={form.watch('formPosition')}
                    onValueChange={(value) => form.setValue('formPosition', value as 'hero' | 'sticky' | 'bottom' | 'inline')}
                  >
                    <SelectTrigger id="formPosition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero</SelectItem>
                      <SelectItem value="sticky">Sticky</SelectItem>
                      <SelectItem value="bottom">Botten</SelectItem>
                      <SelectItem value="inline">Inline</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="hideNav">Dölj navigering</FieldLabel>
                    <Switch
                      id="hideNav"
                      checked={form.watch('hideNav')}
                      onCheckedChange={(checked) => form.setValue('hideNav', checked)}
                    />
                  </div>
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="hideFooter">Dölj footer</FieldLabel>
                    <Switch
                      id="hideFooter"
                      checked={form.watch('hideFooter')}
                      onCheckedChange={(checked) => form.setValue('hideFooter', checked)}
                    />
                  </div>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="urgencyText">Brådskande text</FieldLabel>
                <FieldContent>
                  <Input
                    id="urgencyText"
                    {...form.register('urgencyText')}
                    placeholder="Erbjudandet gäller t.o.m. 31 jan"
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>

          <Separator />

          <FieldSet>
            <FieldLegend className="text-base font-semibold mb-4">Schemaläggning</FieldLegend>
            <FieldGroup className="gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="startDate">Startdatum</FieldLabel>
                  <FieldContent>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      {...form.register('startDate')}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="endDate">Slutdatum</FieldLabel>
                  <FieldContent>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      {...form.register('endDate')}
                    />
                  </FieldContent>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="redirectTo">Omdirigera till (efter kampanj)</FieldLabel>
                <FieldContent>
                  <Input
                    id="redirectTo"
                    {...form.register('redirectTo')}
                    placeholder="/"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="trafficPercent">Trafikprocent (0-100)</FieldLabel>
                <FieldContent>
                  <Input
                    id="trafficPercent"
                    type="number"
                    min="0"
                    max="100"
                    {...form.register('trafficPercent', { valueAsNumber: true })}
                  />
                  <FieldDescription>
                    Andel av trafiken som ska se kampanjen (för gradvis lansering)
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <FieldLabel htmlFor="isTestActive">A/B-test aktiv</FieldLabel>
                    <FieldDescription className="text-xs">
                      Aktivera för att köra A/B-test med varianter
                    </FieldDescription>
                  </div>
                  <Switch
                    id="isTestActive"
                    checked={form.watch('isTestActive')}
                    onCheckedChange={(checked) => form.setValue('isTestActive', checked)}
                  />
                </div>
              </Field>
            </FieldGroup>
          </FieldSet>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6 mt-6">
          <FieldSet>
            <FieldLegend className="text-base font-semibold mb-4">UTM-parametrar</FieldLegend>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="utmSource">UTM Source</FieldLabel>
                <FieldContent>
                  <Input id="utmSource" {...form.register('utmSource')} placeholder="facebook, google, newsletter" />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="utmMedium">UTM Medium</FieldLabel>
                <FieldContent>
                  <Input id="utmMedium" {...form.register('utmMedium')} placeholder="cpc, email, social" />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="utmCampaign">UTM Campaign</FieldLabel>
                <FieldContent>
                  <Input id="utmCampaign" {...form.register('utmCampaign')} placeholder="spring-sale-2026" />
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
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
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <FieldLabel htmlFor="noIndex">No-index (dölj från sökmotorer)</FieldLabel>
                    <FieldDescription className="text-xs">
                      Kampanjsidor indexeras vanligtvis inte
                    </FieldDescription>
                  </div>
                  <Switch
                    id="noIndex"
                    checked={form.watch('noIndex')}
                    onCheckedChange={(checked) => form.setValue('noIndex', checked)}
                  />
                </div>
              </Field>
            </FieldGroup>
          </FieldSet>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/campaigns')}
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
