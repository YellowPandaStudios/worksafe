'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  FieldError,
  FieldLabel,
} from '@/components/ui/field';

const addressSchema = z.object({
  type: z.enum(['billing', 'shipping', 'both']),
  name: z.string().min(1, 'Namn krävs'),
  company: z.string().optional(),
  street: z.string().min(1, 'Gatuadress krävs'),
  street2: z.string().optional(),
  city: z.string().min(1, 'Ort krävs'),
  postalCode: z.string().min(1, 'Postnummer krävs'),
  country: z.string().min(1, 'Land krävs'),
  phone: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  userId: string;
  initialData?: AddressFormData & { id?: string };
  onSuccess: () => void;
}

const TYPE_OPTIONS = [
  { value: 'billing', label: 'Faktureringsadress' },
  { value: 'shipping', label: 'Leveransadress' },
  { value: 'both', label: 'Både fakturering & leverans' },
];

export function AddressForm({ userId, initialData, onSuccess }: AddressFormProps): React.ReactElement {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: initialData?.type || 'both',
      name: initialData?.name || '',
      company: initialData?.company || '',
      street: initialData?.street || '',
      street2: initialData?.street2 || '',
      city: initialData?.city || '',
      postalCode: initialData?.postalCode || '',
      country: initialData?.country || 'SE',
      phone: initialData?.phone || '',
    },
  });

  const onSubmit = async (data: AddressFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      const url = initialData?.id 
        ? `/api/admin/users/${userId}/addresses/${initialData.id}`
        : `/api/admin/users/${userId}/addresses`;
      
      const response = await fetch(url, {
        method: initialData?.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Kunde inte spara adressen');
      }

      toast.success(initialData?.id ? 'Adressen har uppdaterats' : 'Adressen har lagts till');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ett fel uppstod');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="type">Adresstyp *</FieldLabel>
        <FieldContent>
          <Select
            value={form.watch('type')}
            onValueChange={(value) => form.setValue('type', value as AddressFormData['type'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Välj adresstyp" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldContent>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="name">Namn *</FieldLabel>
          <FieldContent>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Förnamn Efternamn"
              aria-invalid={!!form.formState.errors.name}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="company">Företag</FieldLabel>
          <FieldContent>
            <Input
              id="company"
              {...form.register('company')}
              placeholder="Företaget AB"
            />
          </FieldContent>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="street">Gatuadress *</FieldLabel>
        <FieldContent>
          <Input
            id="street"
            {...form.register('street')}
            placeholder="Storgatan 1"
            aria-invalid={!!form.formState.errors.street}
          />
          <FieldError errors={[form.formState.errors.street]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="street2">Gatuadress 2</FieldLabel>
        <FieldContent>
          <Input
            id="street2"
            {...form.register('street2')}
            placeholder="Lägenhet, våning, etc."
          />
        </FieldContent>
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="postalCode">Postnummer *</FieldLabel>
          <FieldContent>
            <Input
              id="postalCode"
              {...form.register('postalCode')}
              placeholder="123 45"
              aria-invalid={!!form.formState.errors.postalCode}
            />
            <FieldError errors={[form.formState.errors.postalCode]} />
          </FieldContent>
        </Field>

        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="city">Ort *</FieldLabel>
          <FieldContent>
            <Input
              id="city"
              {...form.register('city')}
              placeholder="Stockholm"
              aria-invalid={!!form.formState.errors.city}
            />
            <FieldError errors={[form.formState.errors.city]} />
          </FieldContent>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="country">Land *</FieldLabel>
          <FieldContent>
            <Select
              value={form.watch('country')}
              onValueChange={(value) => form.setValue('country', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Välj land" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SE">Sverige</SelectItem>
                <SelectItem value="NO">Norge</SelectItem>
                <SelectItem value="DK">Danmark</SelectItem>
                <SelectItem value="FI">Finland</SelectItem>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="phone">Telefon</FieldLabel>
          <FieldContent>
            <Input
              id="phone"
              {...form.register('phone')}
              placeholder="+46 70 123 45 67"
            />
          </FieldContent>
        </Field>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData?.id ? 'Uppdatera' : 'Lägg till'}
        </Button>
      </div>
    </form>
  );
}
