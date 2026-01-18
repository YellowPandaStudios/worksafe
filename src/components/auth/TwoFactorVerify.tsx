'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { twoFactor } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Shield, Key } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const totpSchema = z.object({
  code: z.string().length(6, 'Koden måste vara 6 siffror'),
  trustDevice: z.boolean().optional(),
});

const backupSchema = z.object({
  backupCode: z.string().min(1, 'Reservkod krävs'),
});

type TotpFormData = z.infer<typeof totpSchema>;
type BackupFormData = z.infer<typeof backupSchema>;

interface TwoFactorVerifyProps {
  callbackUrl?: string;
}

export function TwoFactorVerify({
  callbackUrl = '/',
}: TwoFactorVerifyProps): React.ReactElement {
  const router = useRouter();
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState<string>('');

  const totpForm = useForm<TotpFormData>({
    resolver: zodResolver(totpSchema),
    defaultValues: { code: '', trustDevice: false },
  });

  const backupForm = useForm<BackupFormData>({
    resolver: zodResolver(backupSchema),
    defaultValues: { backupCode: '' },
  });

  const handleVerifyTotp = async (data: TotpFormData): Promise<void> => {
    setError('');
    try {
      const result = await twoFactor.verifyTotp({
        code: data.code,
        trustDevice: data.trustDevice,
      });

      if (result.error) {
        setError(result.error.message || 'Felaktig kod');
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    }
  };

  const handleVerifyBackup = async (data: BackupFormData): Promise<void> => {
    setError('');
    try {
      const result = await twoFactor.verifyBackupCode({
        code: data.backupCode,
      });

      if (result.error) {
        setError(result.error.message || 'Felaktig reservkod');
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <CardTitle>Tvåfaktorsverifiering</CardTitle>
        </div>
        <CardDescription>
          {useBackupCode
            ? 'Ange en av dina reservkoder för att logga in.'
            : 'Ange den 6-siffriga koden från din autentiseringsapp.'}
        </CardDescription>
      </CardHeader>

      {!useBackupCode ? (
        <form onSubmit={totpForm.handleSubmit(handleVerifyTotp)}>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel htmlFor="code">Verifieringskod</FieldLabel>
              <FieldContent>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={totpForm.watch('code')}
                    onChange={(value) => totpForm.setValue('code', value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <FieldError errors={[totpForm.formState.errors.code]} />
              </FieldContent>
            </Field>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="trustDevice"
                checked={totpForm.watch('trustDevice')}
                onCheckedChange={(checked) =>
                  totpForm.setValue('trustDevice', checked === true)
                }
              />
              <Label htmlFor="trustDevice" className="text-sm font-normal">
                Lita på denna enhet i 30 dagar
              </Label>
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={totpForm.formState.isSubmitting}
            >
              {totpForm.formState.isSubmitting ? 'Verifierar...' : 'Verifiera'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setUseBackupCode(true)}
            >
              <Key className="mr-2 h-4 w-4" />
              Använd reservkod istället
            </Button>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={backupForm.handleSubmit(handleVerifyBackup)}>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel htmlFor="backupCode">Reservkod</FieldLabel>
              <FieldContent>
                <Input
                  id="backupCode"
                  type="text"
                  {...backupForm.register('backupCode')}
                  placeholder="Ange din reservkod"
                  aria-invalid={!!backupForm.formState.errors.backupCode}
                />
                <FieldError errors={[backupForm.formState.errors.backupCode]} />
              </FieldContent>
            </Field>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={backupForm.formState.isSubmitting}
            >
              {backupForm.formState.isSubmitting ? 'Verifierar...' : 'Verifiera'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setUseBackupCode(false)}
            >
              Använd autentiseringsapp istället
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
