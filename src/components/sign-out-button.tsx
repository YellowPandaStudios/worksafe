'use client';

import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

export function SignOutButton(): React.ReactElement {
  const router = useRouter();

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    router.push('/logga-in');
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
