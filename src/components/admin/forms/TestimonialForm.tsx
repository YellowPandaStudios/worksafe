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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormSection, FormActions } from '@/components/admin/common';
import { ImagePicker } from '@/components/admin/media';

const testimonialSchema = z.object({
  quote: z.string().min(10, 'Omdömet måste vara minst 10 tecken'),
  name: z.string().min(2, 'Namn måste vara minst 2 tecken'),
  role: z.string().nullable(),
  company: z.string().nullable(),
  image: z.string().nullable(),
  imageAlt: z.string().nullable(),
  serviceCategory: z.string().nullable(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

interface TestimonialFormProps {
  initialData?: {
    id: string;
    quote: string;
    name: string;
    role: string | null;
    company: string | null;
    image: string | null;
    imageAlt: string | null;
    serviceCategory: string | null;
    sortOrder: number;
    isActive: boolean;
  } | null;
}

const CATEGORY_OPTIONS = [
  { value: 'brandskydd', label: 'Brandskydd' },
  { value: 'utbildningar', label: 'Utbildningar' },
  { value: 'hjartstartare', label: 'Hjärtstartare' },
  { value: 'forsta_hjalpen', label: 'Första hjälpen' },
];

export function TestimonialForm({ initialData }: TestimonialFormProps): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: initialData || {
      quote: '',
      name: '',
      role: null,
      company: null,
      image: null,
      imageAlt: null,
      serviceCategory: null,
      sortOrder: 0,
      isActive: true,
    },
  });

  const image = watch('image');
  const serviceCategory = watch('serviceCategory');
  const isActive = watch('isActive');

  const onSubmit = async (data: TestimonialFormData): Promise<void> => {
    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/admin/testimonials/${initialData.id}`
        : '/api/admin/testimonials';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      toast.success(isEditing ? 'Omdömet har uppdaterats' : 'Omdömet har skapats');
      router.push('/admin/testimonials');
      router.refresh();
    } catch (error) {
      console.error('Failed to save testimonial:', error);
      toast.error('Kunde inte spara omdömet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <FormSection title="Omdöme">
        <div className="space-y-2">
          <Label htmlFor="quote">
            Omdömestext <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="quote"
            {...register('quote')}
            placeholder="Skriv kundens omdöme här..."
            rows={4}
          />
          {errors.quote && (
            <p className="text-sm text-destructive">{errors.quote.message}</p>
          )}
        </div>
      </FormSection>

      <FormSection title="Person">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              Namn <span className="text-destructive">*</span>
            </Label>
            <Input id="name" {...register('name')} placeholder="Anna Andersson" />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Roll/Titel</Label>
            <Input
              id="role"
              {...register('role')}
              placeholder="VD, Brandskyddsansvarig..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Företag</Label>
            <Input id="company" {...register('company')} placeholder="Företagsnamn AB" />
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <p className="text-sm text-muted-foreground">
              Koppla omdömet till en tjänstekategori
            </p>
            <Select
              value={serviceCategory || ''}
              onValueChange={(value) =>
                setValue('serviceCategory', value || null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Välj kategori (valfritt)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Ingen kategori</SelectItem>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormSection>

      <FormSection title="Bild">
        <div className="space-y-2">
          <Label>Profilbild</Label>
          <p className="text-sm text-muted-foreground">
            En bild på personen som gett omdömet (valfritt)
          </p>
          <ImagePicker
            value={image}
            onChange={(url) => setValue('image', url)}
          />
        </div>
      </FormSection>

      <FormSection title="Inställningar">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sorteringsordning</Label>
            <p className="text-sm text-muted-foreground">
              Lägre nummer visas först
            </p>
            <Input
              id="sortOrder"
              type="number"
              {...register('sortOrder', { valueAsNumber: true })}
              min={0}
            />
          </div>

          <div className="space-y-2">
            <Label>Aktiv</Label>
            <p className="text-sm text-muted-foreground">
              Inaktiva omdömen visas inte på webbplatsen
            </p>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>
        </div>
      </FormSection>

      <FormActions
        primaryAction={{
          label: isEditing ? 'Spara ändringar' : 'Skapa omdöme',
          loading: isSubmitting,
          type: 'submit',
        }}
        secondaryAction={{
          label: 'Avbryt',
          onClick: () => router.push('/admin/testimonials'),
        }}
      />
    </form>
  );
}
