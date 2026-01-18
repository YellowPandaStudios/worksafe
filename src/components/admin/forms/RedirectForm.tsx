'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const redirectSchema = z.object({
  from: z.string().min(1, 'Fyll i ursprunglig URL').startsWith('/', 'URL måste börja med /'),
  to: z.string().min(1, 'Fyll i mål-URL'),
  type: z.enum(['permanent', 'temporary']),
  note: z.string().nullable(),
});

type RedirectFormData = z.infer<typeof redirectSchema>;

interface RedirectFormProps {
  initialData?: {
    id: string;
    from: string;
    to: string;
    type: string;
    note: string | null;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RedirectForm({ initialData, onSuccess, onCancel }: RedirectFormProps): React.ReactElement {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RedirectFormData>({
    resolver: zodResolver(redirectSchema),
    defaultValues: initialData
      ? {
          from: initialData.from,
          to: initialData.to,
          type: initialData.type as 'permanent' | 'temporary',
          note: initialData.note,
        }
      : {
          from: '',
          to: '',
          type: 'permanent',
          note: null,
        },
  });

  const type = watch('type');

  const onSubmit = async (data: RedirectFormData): Promise<void> => {
    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/admin/redirects/${initialData.id}`
        : '/api/admin/redirects';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save');
      }

      toast.success(isEditing ? 'Redirect uppdaterad' : 'Redirect skapad');
      onSuccess();
    } catch (error) {
      console.error('Failed to save redirect:', error);
      toast.error(error instanceof Error ? error.message : 'Kunde inte spara redirect');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="from">
          Från (ursprunglig URL) <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">Sökvägen som ska omdirigeras</p>
        <Input id="from" {...register('from')} placeholder="/gammal-sida" />
        {errors.from && (
          <p className="text-sm text-destructive">{errors.from.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="to">
          Till (mål-URL) <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">Sökvägen eller URL dit trafiken ska gå</p>
        <Input id="to" {...register('to')} placeholder="/ny-sida eller https://..." />
        {errors.to && (
          <p className="text-sm text-destructive">{errors.to.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Typ av redirect</Label>
        <Select value={type} onValueChange={(value) => setValue('type', value as 'permanent' | 'temporary')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="permanent">301 - Permanent</SelectItem>
            <SelectItem value="temporary">302 - Tillfällig</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Använd 301 för permanenta ändringar, 302 för tillfälliga
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Anteckning</Label>
        <Textarea
          id="note"
          {...register('note')}
          placeholder="Varför denna redirect finns..."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Avbryt
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sparar...' : isEditing ? 'Spara' : 'Skapa'}
        </Button>
      </div>
    </form>
  );
}
