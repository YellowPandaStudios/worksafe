import { getServerUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { User, Package, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function AccountPage(): Promise<React.ReactElement> {
  const sessionUser = await getServerUser();
  
  const user = await prisma.user.findUnique({
    where: { id: sessionUser!.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      customerType: true,
      twoFactorEnabled: true,
      twoFactorGraceExpiresAt: true,
      totalOrders: true,
      totalSpent: true,
      createdAt: true,
    },
  });

  if (!user) {
    return <div>Användare hittades inte</div>;
  }

  const graceExpired = user.twoFactorGraceExpiresAt && new Date() > user.twoFactorGraceExpiresAt;
  const graceDaysLeft = user.twoFactorGraceExpiresAt
    ? Math.max(0, Math.ceil((user.twoFactorGraceExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Välkommen, {user.name}</h1>
        <p className="text-muted-foreground">
          Hantera ditt konto och dina inställningar
        </p>
      </div>

      {/* 2FA Warning */}
      {!user.twoFactorEnabled && (
        <Card className={graceExpired ? 'border-destructive' : 'border-amber-500'}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {graceExpired ? (
                <ShieldAlert className="h-5 w-5 text-destructive" />
              ) : (
                <Clock className="h-5 w-5 text-amber-500" />
              )}
              {graceExpired
                ? 'Tvåfaktorsautentisering krävs'
                : 'Aktivera tvåfaktorsautentisering'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {graceExpired
                ? 'Din grace period har gått ut. Du måste aktivera 2FA för att fortsätta använda ditt konto.'
                : `Du har ${graceDaysLeft} dagar kvar att aktivera tvåfaktorsautentisering för extra säkerhet.`}
            </p>
            <Button asChild>
              <Link href="/konto/sakerhet">Konfigurera 2FA</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ordrar</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              {user.totalOrders}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Totalt spenderat</CardDescription>
            <CardTitle className="text-2xl">
              {new Intl.NumberFormat('sv-SE', {
                style: 'currency',
                currency: 'SEK',
                maximumFractionDigits: 0,
              }).format(Number(user.totalSpent))}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kontosäkerhet</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              {user.twoFactorEnabled ? (
                <>
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <span className="text-green-600">Skyddad</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-5 w-5 text-amber-500" />
                  <span className="text-amber-600">Begränsad</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profilinformation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Namn</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">E-post</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            {user.phone && (
              <div>
                <dt className="text-sm text-muted-foreground">Telefon</dt>
                <dd className="font-medium">{user.phone}</dd>
              </div>
            )}
            {user.company && (
              <div>
                <dt className="text-sm text-muted-foreground">Företag</dt>
                <dd className="font-medium">{user.company}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-muted-foreground">Kundtyp</dt>
              <dd>
                <Badge variant="outline">
                  {user.customerType === 'business' ? 'Företagskund' : 'Privatkund'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Medlem sedan</dt>
              <dd className="font-medium">
                {format(user.createdAt, 'PP', { locale: sv })}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
