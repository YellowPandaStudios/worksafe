'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Loader2, Save, Building, User, CreditCard, Calendar, Package, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

const userProfileSchema = z.object({
  name: z.string().min(1, 'Namn krävs'),
  email: z.string().email('Ogiltig e-postadress'),
  role: z.enum(['super_admin', 'admin', 'editor', 'author', 'customer']),
  customerType: z.enum(['private', 'business']),
  company: z.string().optional(),
  phone: z.string().optional(),
  orgNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  acceptsMarketing: z.boolean(),
  fortnoxCustomerId: z.string().optional(),
});

type UserProfileFormData = z.infer<typeof userProfileSchema>;

const ROLE_OPTIONS = [
  { value: 'super_admin', label: 'Super Admin', description: 'Full systemåtkomst' },
  { value: 'admin', label: 'Admin', description: 'CMS-hantering' },
  { value: 'editor', label: 'Redaktör', description: 'Innehållsredigering' },
  { value: 'author', label: 'Författare', description: 'Begränsad innehållsskapande' },
  { value: 'customer', label: 'Kund', description: 'Endast e-handel' },
];

const CUSTOMER_TYPE_OPTIONS = [
  { value: 'private', label: 'Privatkund' },
  { value: 'business', label: 'Företagskund' },
];

interface UserData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  customerType: string;
  company: string | null;
  orgNumber: string | null;
  vatNumber: string | null;
  phone: string | null;
  acceptsMarketing: boolean;
  marketingConsentAt: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
  fortnoxCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserProfileTabProps {
  user: UserData;
  canEdit: boolean;
  canChangeRole: boolean;
}

export function UserProfileTab({ user, canEdit, canChangeRole }: UserProfileTabProps): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role as UserProfileFormData['role'],
      customerType: user.customerType as UserProfileFormData['customerType'],
      company: user.company || '',
      phone: user.phone || '',
      orgNumber: user.orgNumber || '',
      vatNumber: user.vatNumber || '',
      acceptsMarketing: user.acceptsMarketing,
      fortnoxCustomerId: user.fortnoxCustomerId || '',
    },
  });

  const customerType = form.watch('customerType');

  const onSubmit = async (data: UserProfileFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Kunde inte uppdatera användaren');
      }

      toast.success('Användaren har uppdaterats');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ett fel uppstod');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Stats Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Totala ordrar</CardDescription>
          <CardTitle className="text-3xl flex items-center gap-2">
            <Package className="h-6 w-6 text-muted-foreground" />
            {user.totalOrders}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Totalt spenderat</CardDescription>
          <CardTitle className="text-3xl flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
            {new Intl.NumberFormat('sv-SE', {
              style: 'currency',
              currency: 'SEK',
              maximumFractionDigits: 0,
            }).format(user.totalSpent)}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Medlem sedan</CardDescription>
          <CardTitle className="text-3xl flex items-center gap-2">
            <Calendar className="h-6 w-6 text-muted-foreground" />
            {format(new Date(user.createdAt), 'PP', { locale: sv })}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Profile Form */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Användarinformation
          </CardTitle>
          <CardDescription>
            Grundläggande information om användaren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Namn *</FieldLabel>
                <FieldContent>
                  <Input
                    id="name"
                    {...form.register('name')}
                    disabled={!canEdit}
                    aria-invalid={!!form.formState.errors.name}
                  />
                  <FieldError errors={[form.formState.errors.name]} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="email">E-post *</FieldLabel>
                <FieldContent>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      disabled={!canEdit}
                      aria-invalid={!!form.formState.errors.email}
                    />
                    {user.emailVerified && (
                      <Badge variant="outline" className="shrink-0">Verifierad</Badge>
                    )}
                  </div>
                  <FieldError errors={[form.formState.errors.email]} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Telefon</FieldLabel>
                <FieldContent>
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    disabled={!canEdit}
                    placeholder="+46 70 123 45 67"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="role">Roll</FieldLabel>
                <FieldContent>
                  <Select
                    value={form.watch('role')}
                    onValueChange={(value) => form.setValue('role', value as UserProfileFormData['role'])}
                    disabled={!canChangeRole}
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
                  {!canChangeRole && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Endast super admin kan ändra roller
                    </p>
                  )}
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="customerType">Kundtyp</FieldLabel>
                <FieldContent>
                  <Select
                    value={form.watch('customerType')}
                    onValueChange={(value) => form.setValue('customerType', value as UserProfileFormData['customerType'])}
                    disabled={!canEdit}
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
            </div>

            {customerType === 'business' && (
              <>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor="company">Företagsnamn</FieldLabel>
                    <FieldContent>
                      <Input
                        id="company"
                        {...form.register('company')}
                        disabled={!canEdit}
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
                        disabled={!canEdit}
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
                        disabled={!canEdit}
                        placeholder="SE556123456701"
                      />
                    </FieldContent>
                  </Field>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Marknadsföring</label>
                  <p className="text-sm text-muted-foreground">
                    Användaren godkänner att ta emot marknadsföringsmeddelanden
                  </p>
                </div>
                <Switch
                  checked={form.watch('acceptsMarketing')}
                  onCheckedChange={(checked) => form.setValue('acceptsMarketing', checked)}
                  disabled={!canEdit}
                />
              </div>
              {user.marketingConsentAt && (
                <p className="text-xs text-muted-foreground">
                  Samtycke givet: {format(new Date(user.marketingConsentAt), 'PPp', { locale: sv })}
                </p>
              )}
            </div>

            {canEdit && (
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Spara ändringar
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Integration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Integrationer
          </CardTitle>
          <CardDescription>
            Externa systemkopplingar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field>
            <FieldLabel htmlFor="fortnoxCustomerId">Fortnox Kund-ID</FieldLabel>
            <FieldContent>
              <Input
                id="fortnoxCustomerId"
                {...form.register('fortnoxCustomerId')}
                disabled={!canEdit}
                placeholder="Ej kopplad"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Kopplas automatiskt vid första order
              </p>
            </FieldContent>
          </Field>

          {user.lastOrderAt && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Senaste order</p>
              <p className="font-medium">
                {format(new Date(user.lastOrderAt), 'PPp', { locale: sv })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
