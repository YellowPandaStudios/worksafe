'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function TwoFactorSetupContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const isRequired = searchParams.get('required') === 'true';
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    <TwoFactorSetup isRequired={isRequired} callbackUrl={callbackUrl} />
  );
}

export default function TwoFactorSetupPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Tvåfaktorsautentisering</CardTitle>
            <CardDescription>Laddar...</CardDescription>
          </CardHeader>
        </Card>
      }
    >
      <TwoFactorSetupContent />
    </Suspense>
  );
}
