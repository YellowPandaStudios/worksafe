'use client';

import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  /** Loading text */
  text?: string;
  /** Variant */
  variant?: 'spinner' | 'skeleton' | 'overlay';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

/**
 * Loading state component with multiple variants.
 */
export function LoadingState({
  text = 'Laddar...',
  variant = 'spinner',
  size = 'md',
  className,
}: LoadingStateProps): React.ReactElement {
  if (variant === 'overlay') {
    return (
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10',
          className
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
          {text && (
            <span className={cn('text-muted-foreground', textSizeClasses[size])}>
              {text}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-3', className)}>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 py-8',
        className
      )}
    >
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && (
        <span className={cn('text-muted-foreground', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );
}

/**
 * Loading skeleton for cards.
 */
export function CardSkeleton({
  className,
}: {
  className?: string;
}): React.ReactElement {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="space-y-3">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

/**
 * Loading skeleton for table rows.
 */
export function TableRowSkeleton({
  columns = 4,
  className,
}: {
  columns?: number;
  className?: string;
}): React.ReactElement {
  return (
    <div className={cn('flex items-center gap-4 py-3', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === 0 ? 'w-1/4' : 'w-1/6')}
        />
      ))}
    </div>
  );
}

/**
 * Loading skeleton for forms.
 */
export function FormSkeleton({
  fields = 4,
  className,
}: {
  fields?: number;
  className?: string;
}): React.ReactElement {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Full page loading state.
 */
export function PageLoadingState({
  text = 'Laddar...',
}: {
  text?: string;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingState text={text} size="lg" />
    </div>
  );
}
