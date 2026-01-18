'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TwoFactorVerify } from '@/components/auth/TwoFactorVerify';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function TwoFactorVerifyContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    <TwoFactorVerify callbackUrl={callbackUrl} />
  );
}

export default function TwoFactorVerifyPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Tvåfaktorsverifiering</CardTitle>
            <CardDescription>Laddar...</CardDescription>
          </CardHeader>
        </Card>
      }
    >
      <TwoFactorVerifyContent />
    </Suspense>
  );
}
