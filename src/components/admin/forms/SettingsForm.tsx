'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormSection, FormActions } from '@/components/admin/common';
import { ImagePicker } from '@/components/admin/media';

const settingsSchema = z.object({
  // General
  siteName: z.string().min(1, 'Webbplatsnamn krävs'),
  siteTagline: z.string().nullable(),
  logo: z.string().nullable(),
  favicon: z.string().nullable(),
  // Contact
  email: z.string().email('Ogiltig e-postadress').nullable().or(z.literal('')),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  orgNumber: z.string().nullable(),
  // Social
  linkedIn: z.string().url('Ogiltig URL').nullable().or(z.literal('')),
  facebook: z.string().url('Ogiltig URL').nullable().or(z.literal('')),
  instagram: z.string().url('Ogiltig URL').nullable().or(z.literal('')),
  // SEO
  defaultMetaTitle: z.string().nullable(),
  defaultMetaDescription: z.string().nullable(),
  defaultOgImage: z.string().nullable(),
  // Scripts
  headScripts: z.string().nullable(),
  bodyScripts: z.string().nullable(),
  // Maintenance
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().nullable(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialData: {
    siteName: string;
    siteTagline: string | null;
    logo: string | null;
    favicon: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    orgNumber: string | null;
    linkedIn: string | null;
    facebook: string | null;
    instagram: string | null;
    defaultMetaTitle: string | null;
    defaultMetaDescription: string | null;
    defaultOgImage: string | null;
    headScripts: string | null;
    bodyScripts: string | null;
    maintenanceMode: boolean;
    maintenanceMessage: string | null;
  };
}

export function SettingsForm({ initialData }: SettingsFormProps): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      ...initialData,
      email: initialData.email || '',
      linkedIn: initialData.linkedIn || '',
      facebook: initialData.facebook || '',
      instagram: initialData.instagram || '',
    },
  });

  const logo = watch('logo');
  const favicon = watch('favicon');
  const defaultOgImage = watch('defaultOgImage');
  const maintenanceMode = watch('maintenanceMode');

  const onSubmit = async (data: SettingsFormData): Promise<void> => {
    setIsSubmitting(true);

    try {
      // Convert empty strings to null for optional URL fields
      const cleanData = {
        ...data,
        email: data.email || null,
        linkedIn: data.linkedIn || null,
        facebook: data.facebook || null,
        instagram: data.instagram || null,
      };

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      toast.success('Inställningarna har sparats');
      router.refresh();
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Kunde inte spara inställningarna');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Allmänt</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="social">Sociala medier</TabsTrigger>
          <TabsTrigger value="scripts">Skript</TabsTrigger>
          <TabsTrigger value="maintenance">Underhåll</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-8">
          <FormSection title="Webbplatsinformation">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siteName">
                  Webbplatsnamn <span className="text-destructive">*</span>
                </Label>
                <Input id="siteName" {...register('siteName')} placeholder="Work Safe" />
                {errors.siteName && (
                  <p className="text-sm text-destructive">{errors.siteName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteTagline">Tagline</Label>
                <Input
                  id="siteTagline"
                  {...register('siteTagline')}
                  placeholder="Din säkerhetspartner"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Logotyp</Label>
                <ImagePicker
                  value={logo}
                  onChange={(url) => setValue('logo', url, { shouldDirty: true })}
                />
              </div>

              <div className="space-y-2">
                <Label>Favicon</Label>
                <p className="text-sm text-muted-foreground">
                  Ikonen som visas i webbläsarfliken
                </p>
                <ImagePicker
                  value={favicon}
                  onChange={(url) => setValue('favicon', url, { shouldDirty: true })}
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Kontaktinformation">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="info@worksafe.se"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" {...register('phone')} placeholder="08-123 456 78" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgNumber">Organisationsnummer</Label>
                <Input id="orgNumber" {...register('orgNumber')} placeholder="123456-7890" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adress</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="Gatuadress&#10;123 45 Stad"
                rows={3}
              />
            </div>
          </FormSection>
        </TabsContent>

        <TabsContent value="seo" className="space-y-8">
          <FormSection title="Standard SEO-inställningar">
            <div className="space-y-2">
              <Label htmlFor="defaultMetaTitle">Standard meta-titel</Label>
              <p className="text-sm text-muted-foreground">
                Används när ingen specifik titel är angiven
              </p>
              <Input
                id="defaultMetaTitle"
                {...register('defaultMetaTitle')}
                placeholder="Work Safe - Säkerhetsutrustning och utbildning"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultMetaDescription">Standard meta-beskrivning</Label>
              <Textarea
                id="defaultMetaDescription"
                {...register('defaultMetaDescription')}
                placeholder="Work Safe levererar säkerhetsutrustning, utbildningar och tjänster..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Standard OG-bild</Label>
              <p className="text-sm text-muted-foreground">
                Bild som visas vid delning i sociala medier
              </p>
              <ImagePicker
                value={defaultOgImage}
                onChange={(url) => setValue('defaultOgImage', url, { shouldDirty: true })}
              />
            </div>
          </FormSection>
        </TabsContent>

        <TabsContent value="social" className="space-y-8">
          <FormSection title="Sociala medier">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedIn">LinkedIn</Label>
                <Input
                  id="linkedIn"
                  {...register('linkedIn')}
                  placeholder="https://linkedin.com/company/worksafe"
                />
                {errors.linkedIn && (
                  <p className="text-sm text-destructive">{errors.linkedIn.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  {...register('facebook')}
                  placeholder="https://facebook.com/worksafe"
                />
                {errors.facebook && (
                  <p className="text-sm text-destructive">{errors.facebook.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  {...register('instagram')}
                  placeholder="https://instagram.com/worksafe"
                />
                {errors.instagram && (
                  <p className="text-sm text-destructive">{errors.instagram.message}</p>
                )}
              </div>
            </div>
          </FormSection>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-8">
          <FormSection title="Anpassade skript">
            <div className="space-y-2">
              <Label htmlFor="headScripts">Head-skript</Label>
              <p className="text-sm text-muted-foreground">
                Skript som läggs till i &lt;head&gt; (t.ex. Google Analytics)
              </p>
              <Textarea
                id="headScripts"
                {...register('headScripts')}
                placeholder="<!-- Google Analytics -->&#10;<script>...</script>"
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyScripts">Body-skript</Label>
              <p className="text-sm text-muted-foreground">
                Skript som läggs till före &lt;/body&gt;
              </p>
              <Textarea
                id="bodyScripts"
                {...register('bodyScripts')}
                placeholder="<!-- Chat widget -->&#10;<script>...</script>"
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </FormSection>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-8">
          <FormSection title="Underhållsläge">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aktivera underhållsläge</Label>
                  <p className="text-sm text-muted-foreground">
                    När aktiverat visas ett underhållsmeddelande för besökare
                  </p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={(checked) =>
                    setValue('maintenanceMode', checked, { shouldDirty: true })
                  }
                />
              </div>

              {maintenanceMode && (
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMessage">Underhållsmeddelande</Label>
                  <Textarea
                    id="maintenanceMessage"
                    {...register('maintenanceMessage')}
                    placeholder="Vi utför planerat underhåll. Vänligen återkom senare."
                    rows={4}
                  />
                </div>
              )}
            </div>
          </FormSection>
        </TabsContent>
      </Tabs>

      <FormActions
        primaryAction={{
          label: 'Spara inställningar',
          loading: isSubmitting,
          disabled: !isDirty,
          type: 'submit',
        }}
        className="mt-8"
      />
    </form>
  );
}
