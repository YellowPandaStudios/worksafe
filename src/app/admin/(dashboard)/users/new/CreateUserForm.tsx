'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Save, User, Building, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

const createUserSchema = z.object({
  name: z.string().min(1, 'Namn krävs'),
  email: z.string().email('Ogiltig e-postadress'),
  password: z.string().min(8, 'Lösenord måste vara minst 8 tecken'),
  role: z.enum(['super_admin', 'admin', 'editor', 'author', 'customer']),
  customerType: z.enum(['private', 'business']),
  company: z.string().optional(),
  phone: z.string().optional(),
  orgNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  sendWelcomeEmail: z.boolean(),
  requireEmailVerification: z.boolean(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

const ROLE_OPTIONS = [
  { value: 'customer', label: 'Kund', description: 'Endast e-handel' },
  { value: 'author', label: 'Författare', description: 'Begränsad innehållsskapande' },
  { value: 'editor', label: 'Redaktör', description: 'Innehållsredigering' },
  { value: 'admin', label: 'Admin', description: 'CMS-hantering' },
  { value: 'super_admin', label: 'Super Admin', description: 'Full systemåtkomst' },
];

const CUSTOMER_TYPE_OPTIONS = [
  { value: 'private', label: 'Privatkund' },
  { value: 'business', label: 'Företagskund' },
];

export function CreateUserForm(): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'customer',
      customerType: 'private',
      company: '',
      phone: '',
      orgNumber: '',
      vatNumber: '',
      sendWelcomeEmail: true,
      requireEmailVerification: false,
    },
  });

  const customerType = form.watch('customerType');

  const onSubmit = async (data: CreateUserFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Kunde inte skapa användaren');
      }

      const result = await response.json();
      toast.success('Användaren har skapats');
      router.push(`/admin/users/${result.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ett fel uppstod');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePassword = (): void => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue('password', password);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Grundläggande information
            </CardTitle>
            <CardDescription>
              Användarens namn och kontaktuppgifter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <FieldLabel htmlFor="email">E-post *</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="namn@exempel.se"
                  aria-invalid={!!form.formState.errors.email}
                />
                <FieldError errors={[form.formState.errors.email]} />
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

            <Separator />

            <Field>
              <FieldLabel htmlFor="password">Lösenord *</FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="text"
                    {...form.register('password')}
                    placeholder="Minst 8 tecken"
                    aria-invalid={!!form.formState.errors.password}
                  />
                  <Button type="button" variant="outline" onClick={generatePassword}>
                    Generera
                  </Button>
                </div>
                <FieldError errors={[form.formState.errors.password]} />
              </FieldContent>
            </Field>
          </CardContent>
        </Card>

        {/* Role & Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roll och behörigheter
            </CardTitle>
            <CardDescription>
              Användarens roll och kundtyp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel htmlFor="role">Roll *</FieldLabel>
              <FieldContent>
                <Select
                  value={form.watch('role')}
                  onValueChange={(value) => form.setValue('role', value as CreateUserFormData['role'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj roll" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="customerType">Kundtyp *</FieldLabel>
              <FieldContent>
                <Select
                  value={form.watch('customerType')}
                  onValueChange={(value) => form.setValue('customerType', value as CreateUserFormData['customerType'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj kundtyp" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Skicka välkomstmail</label>
                  <p className="text-sm text-muted-foreground">
                    Användaren får ett mail med inloggningsuppgifter
                  </p>
                </div>
                <Switch
                  checked={form.watch('sendWelcomeEmail')}
                  onCheckedChange={(checked) => form.setValue('sendWelcomeEmail', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Kräv e-postverifiering</label>
                  <p className="text-sm text-muted-foreground">
                    Användaren måste verifiera sin e-post före inloggning
                  </p>
                </div>
                <Switch
                  checked={form.watch('requireEmailVerification')}
                  onCheckedChange={(checked) => form.setValue('requireEmailVerification', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Info */}
        {customerType === 'business' && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Företagsinformation
              </CardTitle>
              <CardDescription>
                Information för företagskunder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="company">Företagsnamn</FieldLabel>
                  <FieldContent>
                    <Input
                      id="company"
                      {...form.register('company')}
                      placeholder="Företaget AB"
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="orgNumber">Organisationsnummer</FieldLabel>
                  <FieldContent>
                    <Input
                      id="orgNumber"
                      {...form.register('orgNumber')}
                      placeholder="556123-4567"
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="vatNumber">Momsregistreringsnummer</FieldLabel>
                  <FieldContent>
                    <Input
                      id="vatNumber"
                      {...form.register('vatNumber')}
                      placeholder="SE556123456701"
                    />
                  </FieldContent>
                </Field>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/users')}
        >
          Avbryt
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Skapa användare
        </Button>
      </div>
    </form>
  );
}
