'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        // Content status
        draft: 'bg-muted text-muted-foreground',
        published: 'bg-success-light text-success',
        scheduled: 'bg-info-light text-info',
        archived: 'bg-muted text-muted-foreground',
        // General status
        active: 'bg-success-light text-success',
        inactive: 'bg-muted text-muted-foreground',
        pending: 'bg-warning-light text-warning',
        // Order/payment status
        paid: 'bg-success-light text-success',
        unpaid: 'bg-warning-light text-warning',
        refunded: 'bg-muted text-muted-foreground',
        failed: 'bg-error-light text-error',
        // Shipping status
        processing: 'bg-info-light text-info',
        shipped: 'bg-primary/10 text-primary',
        delivered: 'bg-success-light text-success',
        cancelled: 'bg-error-light text-error',
        // User status
        verified: 'bg-success-light text-success',
        unverified: 'bg-warning-light text-warning',
        blocked: 'bg-error-light text-error',
        // Generic
        success: 'bg-success-light text-success',
        warning: 'bg-warning-light text-warning',
        error: 'bg-error-light text-error',
        info: 'bg-info-light text-info',
        default: 'bg-muted text-muted-foreground',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export type StatusBadgeVariant = NonNullable<
  VariantProps<typeof statusBadgeVariants>['variant']
>;

export interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  /** Badge label */
  children: React.ReactNode;
  /** Optional dot indicator */
  showDot?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Status badge with consistent styling across the admin panel.
 */
export function StatusBadge({
  children,
  variant = 'default',
  size = 'md',
  showDot = false,
  className,
}: StatusBadgeProps): React.ReactElement {
  return (
    <span className={cn(statusBadgeVariants({ variant, size }), className)}>
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', {
            'bg-muted-foreground': variant === 'draft' || variant === 'inactive' || variant === 'archived' || variant === 'refunded' || variant === 'default',
            'bg-success': variant === 'published' || variant === 'active' || variant === 'paid' || variant === 'delivered' || variant === 'verified' || variant === 'success',
            'bg-warning': variant === 'pending' || variant === 'unpaid' || variant === 'unverified' || variant === 'warning',
            'bg-error': variant === 'failed' || variant === 'cancelled' || variant === 'blocked' || variant === 'error',
            'bg-info': variant === 'scheduled' || variant === 'processing' || variant === 'info',
            'bg-primary': variant === 'shipped',
          })}
        />
      )}
      {children}
    </span>
  );
}

/**
 * Predefined status labels in Swedish.
 */
export const STATUS_LABELS: Record<string, string> = {
  // Content
  draft: 'Utkast',
  published: 'Publicerad',
  scheduled: 'Schemalagd',
  archived: 'Arkiverad',
  // General
  active: 'Aktiv',
  inactive: 'Inaktiv',
  pending: 'Väntande',
  // Orders
  paid: 'Betald',
  unpaid: 'Obetald',
  refunded: 'Återbetald',
  failed: 'Misslyckad',
  // Shipping
  processing: 'Behandlas',
  shipped: 'Skickad',
  delivered: 'Levererad',
  cancelled: 'Avbruten',
  // Users
  verified: 'Verifierad',
  unverified: 'Ej verifierad',
  blocked: 'Blockerad',
};

/**
 * Helper to get status label.
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

/**
 * Helper to render a status badge with label.
 */
export function renderStatusBadge(
  status: string,
  options?: { showDot?: boolean; size?: StatusBadgeProps['size'] }
): React.ReactElement {
  return (
    <StatusBadge
      variant={status as StatusBadgeVariant}
      showDot={options?.showDot}
      size={options?.size}
    >
      {getStatusLabel(status)}
    </StatusBadge>
  );
}
