import { getServerUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { TwoFactorSettings } from './TwoFactorSettings';

export default async function SecurityPage(): Promise<React.ReactElement> {
  const sessionUser = await getServerUser();
  
  const user = await prisma.user.findUnique({
    where: { id: sessionUser!.id },
    select: {
      id: true,
      name: true,
      email: true,
      twoFactorEnabled: true,
      twoFactorGraceExpiresAt: true,
      twoFactor: {
        select: {
          createdAt: true,
        },
      },
      createdAt: true,
    },
  });

  if (!user) {
    return <div>Användare hittades inte</div>;
  }

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    twoFactorEnabled: user.twoFactorEnabled,
    twoFactorGraceExpiresAt: user.twoFactorGraceExpiresAt?.toISOString() || null,
    twoFactorSetupAt: user.twoFactor?.createdAt?.toISOString() || null,
    createdAt: user.createdAt.toISOString(),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Säkerhet</h1>
        <p className="text-muted-foreground">
          Hantera dina säkerhetsinställningar och tvåfaktorsautentisering
        </p>
      </div>

      <TwoFactorSettings user={userData} />
    </div>
  );
}
