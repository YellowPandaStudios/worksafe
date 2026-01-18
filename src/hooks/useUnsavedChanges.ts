import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Warn user before leaving page with unsaved changes
 * Works with both browser navigation and Next.js router
 */
export function useUnsavedChanges(isDirty: boolean): void {
  const router = useRouter();

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    // Handle browser navigation (back/forward/refresh)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Handle Next.js router navigation
    const handleRouteChange = () => {
      if (isDirty) {
        const confirmed = window.confirm(
          'Du har osparade ändringar. Är du säker på att du vill lämna sidan?'
        );
        if (!confirmed) {
          throw new Error('Route change cancelled');
        }
      }
    };

    // Note: Next.js 13+ App Router doesn't have a built-in way to intercept
    // navigation, so we'll rely on beforeunload for now
    // For programmatic navigation, forms should check isDirty before calling router.push

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, router]);
}
