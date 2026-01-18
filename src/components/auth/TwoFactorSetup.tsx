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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Shield, Copy, Check, AlertTriangle } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const passwordSchema = z.object({
  password: z.string().min(1, 'Lösenord krävs'),
});

const verifySchema = z.object({
  code: z.string().length(6, 'Koden måste vara 6 siffror'),
});

type PasswordFormData = z.infer<typeof passwordSchema>;
type VerifyFormData = z.infer<typeof verifySchema>;

interface TwoFactorSetupProps {
  isRequired?: boolean;
  callbackUrl?: string;
}

type SetupStep = 'password' | 'qrcode' | 'verify' | 'backup' | 'complete';

export function TwoFactorSetup({
  isRequired = false,
  callbackUrl = '/',
}: TwoFactorSetupProps): React.ReactElement {
  const router = useRouter();
  const [step, setStep] = useState<SetupStep>('password');
  const [totpUri, setTotpUri] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [copiedBackup, setCopiedBackup] = useState(false);

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '' },
  });

  const verifyForm = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '' },
  });

  const handleEnableTotp = async (data: PasswordFormData): Promise<void> => {
    setError('');
    try {
      const result = await twoFactor.enable({
        password: data.password,
      });

      if (result.error) {
        setError(result.error.message || 'Kunde inte aktivera 2FA');
        return;
      }

      if (result.data) {
        setTotpUri(result.data.totpURI);
        setBackupCodes(result.data.backupCodes);
        setStep('qrcode');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    }
  };

  const handleVerifyTotp = async (data: VerifyFormData): Promise<void> => {
    setError('');
    try {
      const result = await twoFactor.verifyTotp({
        code: data.code,
      });

      if (result.error) {
        setError(result.error.message || 'Felaktig kod');
        return;
      }

      setStep('backup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    }
  };

  const handleCopyBackupCodes = async (): Promise<void> => {
    const codesText = backupCodes.join('\n');
    await navigator.clipboard.writeText(codesText);
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const handleComplete = (): void => {
    setStep('complete');
    setTimeout(() => {
      router.push(callbackUrl);
      router.refresh();
    }, 2000);
  };

  // Generate QR code as data URL
  const generateQrCodeUrl = (uri: string): string => {
    // Using a Google Charts API for QR code generation (simple solution)
    // In production, you might want to use a library like qrcode.react
    const encoded = encodeURIComponent(uri);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <CardTitle>Tvåfaktorsautentisering</CardTitle>
        </div>
        <CardDescription>
          {isRequired
            ? 'Du måste aktivera tvåfaktorsautentisering för att fortsätta.'
            : 'Lägg till ett extra lager av säkerhet till ditt konto.'}
        </CardDescription>
      </CardHeader>

      {step === 'password' && (
        <form onSubmit={passwordForm.handleSubmit(handleEnableTotp)}>
          <CardContent className="space-y-4">
            {isRequired && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Åtgärd krävs</AlertTitle>
                <AlertDescription>
                  Din grace period har gått ut. Du måste aktivera 2FA för att fortsätta använda ditt konto.
                </AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground">
              Ange ditt lösenord för att börja konfigurera tvåfaktorsautentisering.
            </p>
            <Field>
              <FieldLabel htmlFor="password">Lösenord</FieldLabel>
              <FieldContent>
                <Input
                  id="password"
                  type="password"
                  {...passwordForm.register('password')}
                  placeholder="••••••••"
                  aria-invalid={!!passwordForm.formState.errors.password}
                />
                <FieldError errors={[passwordForm.formState.errors.password]} />
              </FieldContent>
            </Field>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={passwordForm.formState.isSubmitting}
            >
              {passwordForm.formState.isSubmitting ? 'Laddar...' : 'Fortsätt'}
            </Button>
          </CardFooter>
        </form>
      )}

      {step === 'qrcode' && (
        <>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Skanna QR-koden med din autentiseringsapp (t.ex. Google Authenticator, Authy).
            </p>
            <div className="flex justify-center rounded-lg border bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={generateQrCodeUrl(totpUri)}
                alt="QR-kod för tvåfaktorsautentisering"
                width={200}
                height={200}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Kan du inte skanna? Ange denna kod manuellt:
              </p>
              <code className="block break-all rounded bg-muted px-2 py-1 text-xs">
                {totpUri.split('secret=')[1]?.split('&')[0] || ''}
              </code>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setStep('verify')} className="w-full">
              Jag har skannat koden
            </Button>
          </CardFooter>
        </>
      )}

      {step === 'verify' && (
        <form onSubmit={verifyForm.handleSubmit(handleVerifyTotp)}>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ange den 6-siffriga koden från din autentiseringsapp för att verifiera konfigurationen.
            </p>
            <Field>
              <FieldLabel htmlFor="code">Verifieringskod</FieldLabel>
              <FieldContent>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verifyForm.watch('code')}
                    onChange={(value) => verifyForm.setValue('code', value)}
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
                <FieldError errors={[verifyForm.formState.errors.code]} />
              </FieldContent>
            </Field>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('qrcode')}
            >
              Tillbaka
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={verifyForm.formState.isSubmitting}
            >
              {verifyForm.formState.isSubmitting ? 'Verifierar...' : 'Verifiera'}
            </Button>
          </CardFooter>
        </form>
      )}

      {step === 'backup' && (
        <>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Spara dina reservkoder</AlertTitle>
              <AlertDescription>
                Dessa koder kan användas om du förlorar tillgång till din autentiseringsapp.
                Spara dem på ett säkert ställe.
              </AlertDescription>
            </Alert>
            <div className="rounded-lg border bg-muted p-4">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="rounded bg-background px-2 py-1">
                    {code}
                  </div>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCopyBackupCodes}
            >
              {copiedBackup ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Kopierat!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Kopiera reservkoder
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter>
            <Button onClick={handleComplete} className="w-full">
              Jag har sparat mina koder
            </Button>
          </CardFooter>
        </>
      )}

      {step === 'complete' && (
        <CardContent className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold">2FA aktiverat!</h3>
            <p className="text-sm text-muted-foreground">
              Ditt konto är nu skyddat med tvåfaktorsautentisering.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
