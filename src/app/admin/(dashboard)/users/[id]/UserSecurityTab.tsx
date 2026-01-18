'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { toast } from 'sonner';
import { 
  Shield, 
  ShieldOff, 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  Loader2,
  KeyRound,
  Smartphone,
  Eye,
  Copy,
  Check,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { twoFactor } from '@/lib/auth-client';

interface UserData {
  id: string;
  name: string;
  email: string;
  twoFactorEnabled: boolean;
  twoFactorGraceExpiresAt: string | null;
  twoFactorSetupAt: string | null;
  createdAt: string;
}

interface UserSecurityTabProps {
  user: UserData;
  canResetTwoFactor: boolean;
  isOwnProfile: boolean;
}

type SetupStep = 'idle' | 'password' | 'qr' | 'verify' | 'backup';

export function UserSecurityTab({ user, canResetTwoFactor, isOwnProfile }: UserSecurityTabProps): React.ReactElement {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);
  
  // 2FA Setup state (for own profile)
  const [setupStep, setSetupStep] = useState<SetupStep>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [totpUri, setTotpUri] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');

  // Reset other user's 2FA
  const handleReset2FA = async (): Promise<void> => {
    setIsResetting(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/reset-2fa`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Kunde inte återställa 2FA');
      }

      toast.success('Tvåfaktorsautentisering har återställts');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ett fel uppstod');
    } finally {
      setIsResetting(false);
    }
  };

  // Calculate grace period progress
  const getGracePeriodInfo = () => {
    if (user.twoFactorEnabled || !user.twoFactorGraceExpiresAt) {
      return null;
    }

    const now = new Date();
    const expiresAt = new Date(user.twoFactorGraceExpiresAt);
    
    // Calculate total grace period (30 days)
    const totalDays = 30;
    const totalMs = totalDays * 24 * 60 * 60 * 1000;
    
    // Calculate remaining time
    const remainingMs = expiresAt.getTime() - now.getTime();
    const remainingDays = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
    
    // Calculate progress (how much time has passed)
    const elapsedMs = totalMs - remainingMs;
    const progress = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
    
    const isExpired = now >= expiresAt;

    return {
      remainingDays,
      progress,
      isExpired,
      expiresAt,
    };
  };

  const gracePeriod = getGracePeriodInfo();

  // ========== 2FA Setup Flow (for own profile) ==========

  // Step 1: Verify password
  const handlePasswordSubmit = async () => {
    if (!password) return;
    setIsLoading(true);

    try {
      const result = await twoFactor.enable({ password });
      
      if (result.error) {
        toast.error(result.error.message || 'Fel lösenord');
        return;
      }

      if (result.data?.totpURI) {
        setTotpUri(result.data.totpURI);
        setSetupStep('qr');
      }
    } catch (error) {
      toast.error('Ett fel uppstod');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify TOTP code
  const handleTotpVerify = async () => {
    if (totpCode.length !== 6) return;
    setIsLoading(true);

    try {
      const result = await twoFactor.verifyTotp({ code: totpCode });

      if (result.error) {
        toast.error(result.error.message || 'Ogiltig kod');
        setTotpCode('');
        return;
      }

      // Get backup codes
      const backupResult = await twoFactor.generateBackupCodes({ password });
      if (backupResult.data?.backupCodes) {
        setBackupCodes(backupResult.data.backupCodes);
      }

      setSetupStep('backup');
    } catch (error) {
      toast.error('Ett fel uppstod vid verifiering');
      setTotpCode('');
    } finally {
      setIsLoading(false);
    }
  };

  // Disable own 2FA
  const handleDisable2FA = async () => {
    if (!disablePassword) return;
    setIsLoading(true);

    try {
      const result = await twoFactor.disable({ password: disablePassword });

      if (result.error) {
        toast.error(result.error.message || 'Kunde inte inaktivera 2FA');
        return;
      }

      toast.success('Tvåfaktorsautentisering har inaktiverats');
      setDisableDialogOpen(false);
      setDisablePassword('');
      router.refresh();
    } catch (error) {
      toast.error('Ett fel uppstod');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy backup codes
  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
    toast.success('Reservkoder kopierade');
  };

  // Complete setup
  const handleComplete = () => {
    setSetupStep('idle');
    setPassword('');
    setTotpCode('');
    setTotpUri('');
    setBackupCodes([]);
    router.refresh();
  };

  // Reset setup state
  const resetSetupState = () => {
    setSetupStep('idle');
    setPassword('');
    setTotpCode('');
    setTotpUri('');
  };

  // Render setup dialog content based on step
  const renderSetupContent = () => {
    switch (setupStep) {
      case 'password':
        return (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verifiera din identitet</DialogTitle>
              <DialogDescription>
                Ange ditt lösenord för att fortsätta
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                type="password"
                placeholder="Ditt lösenord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetSetupState}>
                Avbryt
              </Button>
              <Button onClick={handlePasswordSubmit} disabled={!password || isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Fortsätt
              </Button>
            </DialogFooter>
          </DialogContent>
        );

      case 'qr':
        return (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Skanna QR-koden</DialogTitle>
              <DialogDescription>
                Använd en autentiseringsapp som Google Authenticator eller Authy
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4 py-4">
              {totpUri && (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`}
                  alt="2FA QR Code"
                  className="rounded-lg"
                  width={200}
                  height={200}
                />
              )}
              <p className="text-sm text-center text-muted-foreground">
                Kan du inte skanna? Ange manuellt:<br />
                <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                  {totpUri.split('secret=')[1]?.split('&')[0]}
                </code>
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetSetupState}>
                Avbryt
              </Button>
              <Button onClick={() => setSetupStep('verify')}>
                Jag har skannat koden
              </Button>
            </DialogFooter>
          </DialogContent>
        );

      case 'verify':
        return (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ange verifieringskod</DialogTitle>
              <DialogDescription>
                Ange den 6-siffriga koden från din autentiseringsapp
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-4">
              <InputOTP
                maxLength={6}
                value={totpCode}
                onChange={setTotpCode}
                onComplete={handleTotpVerify}
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setSetupStep('qr')}>
                Tillbaka
              </Button>
              <Button onClick={handleTotpVerify} disabled={totpCode.length !== 6 || isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verifiera
              </Button>
            </DialogFooter>
          </DialogContent>
        );

      case 'backup':
        return (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                2FA aktiverad!
              </DialogTitle>
              <DialogDescription>
                Spara dessa reservkoder på en säker plats. Du kan använda dem om du förlorar åtkomst till din autentiseringsapp.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="relative">
                <div className={`grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm ${!showBackupCodes ? 'blur-sm' : ''}`}>
                  {backupCodes.map((code, i) => (
                    <div key={i} className="text-center">{code}</div>
                  ))}
                </div>
                {!showBackupCodes && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute inset-0 m-auto w-fit"
                    onClick={() => setShowBackupCodes(true)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Visa koder
                  </Button>
                )}
              </div>
              <Button variant="outline" className="w-full" onClick={copyBackupCodes}>
                {copiedBackup ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                Kopiera reservkoder
              </Button>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Varje reservkod kan endast användas en gång. Förvara dem säkert.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button onClick={handleComplete} className="w-full">
                Jag har sparat mina koder
              </Button>
            </DialogFooter>
          </DialogContent>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 2FA Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tvåfaktorsautentisering (2FA)
          </CardTitle>
          <CardDescription>
            Skyddar kontot med en extra verifieringsnivå vid inloggning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.twoFactorEnabled ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              ) : gracePeriod?.isExpired ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                  <ShieldOff className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              )}
              <div>
                <p className="font-medium">
                  {user.twoFactorEnabled
                    ? '2FA är aktiverad'
                    : gracePeriod?.isExpired
                    ? '2FA krävs - Grace period utgången'
                    : '2FA väntar på aktivering'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.twoFactorEnabled && user.twoFactorSetupAt
                    ? `Aktiverad: ${format(new Date(user.twoFactorSetupAt), 'PPp', { locale: sv })}`
                    : gracePeriod
                    ? `${gracePeriod.remainingDays} dagar kvar av grace period`
                    : 'Ingen grace period satt'}
                </p>
              </div>
            </div>
            <Badge variant={user.twoFactorEnabled ? 'default' : gracePeriod?.isExpired ? 'destructive' : 'secondary'}>
              {user.twoFactorEnabled ? 'Aktiverad' : gracePeriod?.isExpired ? 'Krävs' : 'Väntar'}
            </Badge>
          </div>

          {/* Grace Period Progress */}
          {gracePeriod && !user.twoFactorEnabled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Grace period</span>
                <span className={gracePeriod.isExpired ? 'text-destructive' : ''}>
                  {gracePeriod.isExpired
                    ? 'Utgången'
                    : `${gracePeriod.remainingDays} dagar kvar`}
                </span>
              </div>
              <Progress 
                value={gracePeriod.progress} 
                className={gracePeriod.isExpired ? '[&>div]:bg-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Utgår: {format(gracePeriod.expiresAt, 'PPP', { locale: sv })}
              </p>
            </div>
          )}

          {/* Warning if expired */}
          {gracePeriod?.isExpired && !user.twoFactorEnabled && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Grace period utgången</AlertTitle>
              <AlertDescription>
                {isOwnProfile 
                  ? 'Du måste aktivera 2FA för att fortsätta använda ditt konto.'
                  : 'Användaren måste aktivera 2FA för att kunna fortsätta använda sitt konto.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t space-y-3">
            {isOwnProfile ? (
              // Own profile: Can activate/deactivate 2FA
              <>
                {!user.twoFactorEnabled ? (
                  <Button onClick={() => setSetupStep('password')} className="w-full">
                    <Shield className="mr-2 h-4 w-4" />
                    Aktivera 2FA
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => setDisableDialogOpen(true)}
                    className="w-full text-destructive hover:text-destructive"
                  >
                    <ShieldOff className="mr-2 h-4 w-4" />
                    Inaktivera 2FA
                  </Button>
                )}
              </>
            ) : (
              // Other user's profile
              <>
                {user.twoFactorEnabled && canResetTwoFactor && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <ShieldOff className="mr-2 h-4 w-4" />
                        Återställ 2FA
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Återställ tvåfaktorsautentisering?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Detta kommer att inaktivera 2FA för <strong>{user.name}</strong> och 
                          ge dem en ny 30-dagars grace period för att konfigurera det igen.
                          <br /><br />
                          Användaren måste konfigurera 2FA på nytt för att fortsätta använda 
                          sitt konto efter grace perioden.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isResetting}>Avbryt</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleReset2FA}
                          disabled={isResetting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Återställ 2FA
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {!user.twoFactorEnabled && (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Användaren måste själv aktivera 2FA via sitt konto.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2FA How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Hur 2FA fungerar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-4 rounded-lg border">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-3">
                <span className="text-lg font-bold text-primary">1</span>
              </div>
              <h4 className="font-medium mb-1">Grace period</h4>
              <p className="text-sm text-muted-foreground">
                Nya användare har 30 dagar på sig att aktivera 2FA
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg border">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-3">
                <span className="text-lg font-bold text-primary">2</span>
              </div>
              <h4 className="font-medium mb-1">Konfigurering</h4>
              <p className="text-sm text-muted-foreground">
                Användaren skannar en QR-kod med en autentiseringsapp
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg border">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-3">
                <span className="text-lg font-bold text-primary">3</span>
              </div>
              <h4 className="font-medium mb-1">Inloggning</h4>
              <p className="text-sm text-muted-foreground">
                Vid varje inloggning krävs en 6-siffrig kod från appen
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Security Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Kontosäkerhet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">E-post verifierad</dt>
              <dd>
                <Badge variant={user.twoFactorEnabled ? 'default' : 'secondary'}>
                  {user.twoFactorEnabled ? 'Ja' : 'Nej'}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Konto skapat</dt>
              <dd>{format(new Date(user.createdAt), 'PPP', { locale: sv })}</dd>
            </div>
            {user.twoFactorSetupAt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">2FA aktiverad</dt>
                <dd>{format(new Date(user.twoFactorSetupAt), 'PPP', { locale: sv })}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Setup Dialog (only for own profile) */}
      {isOwnProfile && (
        <Dialog open={setupStep !== 'idle'} onOpenChange={(open) => !open && resetSetupState()}>
          {renderSetupContent()}
        </Dialog>
      )}

      {/* Disable 2FA Dialog (only for own profile) */}
      {isOwnProfile && (
        <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <ShieldOff className="h-5 w-5" />
                Inaktivera 2FA?
              </DialogTitle>
              <DialogDescription>
                Detta gör ditt konto mindre säkert. Du kommer att få en ny grace period på 30 dagar för att återaktivera 2FA.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Efter grace perioden måste du aktivera 2FA igen för att fortsätta använda ditt konto.
                </AlertDescription>
              </Alert>
              <Input
                type="password"
                placeholder="Bekräfta med ditt lösenord"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDisableDialogOpen(false)}>
                Avbryt
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDisable2FA}
                disabled={!disablePassword || isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Inaktivera 2FA
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
