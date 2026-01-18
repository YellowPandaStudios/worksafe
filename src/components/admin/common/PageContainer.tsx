'use client';

import { cn } from '@/lib/utils';

export interface PageContainerProps {
  children: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Narrow width variant for forms and detail pages */
  variant?: 'default' | 'narrow' | 'wide';
}

/**
 * Consistent page container for admin pages.
 * Provides proper spacing and optional width constraints.
 */
export function PageContainer({
  children,
  className,
  variant = 'default',
}: PageContainerProps): React.ReactElement {
  return (
    <div
      className={cn(
        'admin-page',
        {
          'max-w-4xl': variant === 'narrow',
          'max-w-7xl': variant === 'wide',
        },
        className
      )}
    >
      {children}
    </div>
  );
}
