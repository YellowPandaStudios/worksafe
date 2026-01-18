'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface StatCardProps {
  /** Stat label/title */
  label: string;
  /** The main value to display */
  value: string | number;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Change from previous period */
  change?: {
    value: number;
    label?: string;
  };
  /** Optional description below the value */
  description?: string;
  /** Loading state */
  loading?: boolean;
  /** Additional className */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Dashboard stat card for displaying metrics.
 */
export function StatCard({
  label,
  value,
  icon,
  change,
  description,
  loading = false,
  className,
  onClick,
}: StatCardProps): React.ReactElement {
  const isPositive = change && change.value > 0;
  const isNegative = change && change.value < 0;
  const isNeutral = change && change.value === 0;

  return (
    <div
      className={cn(
        'dashboard-card-responsive',
        onClick && 'cursor-pointer hover:border-primary/50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <div className="dashboard-card-header">
        <span className="dashboard-card-label">{label}</span>
        {icon && <div className="dashboard-card-icon">{icon}</div>}
      </div>
      <div className="mt-2">
        {loading ? (
          <>
            <Skeleton className="h-8 w-24 mb-1" />
            {change && <Skeleton className="h-4 w-16" />}
          </>
        ) : (
          <>
            <div className="dashboard-card-value">{value}</div>
            {change && (
              <div
                className={cn(
                  'dashboard-card-change',
                  isPositive && 'dashboard-card-change-positive',
                  isNegative && 'dashboard-card-change-negative'
                )}
              >
                {isPositive && <TrendingUp className="h-3 w-3" />}
                {isNegative && <TrendingDown className="h-3 w-3" />}
                {isNeutral && <Minus className="h-3 w-3" />}
                <span>
                  {isPositive && '+'}
                  {change.value}%
                  {change.label && ` ${change.label}`}
                </span>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export interface StatCardGridProps {
  children: React.ReactNode;
  /** Number of columns */
  columns?: 2 | 3 | 4;
  /** Additional className */
  className?: string;
}

/**
 * Grid container for stat cards.
 */
export function StatCardGrid({
  children,
  columns = 4,
  className,
}: StatCardGridProps): React.ReactElement {
  return (
    <div
      className={cn(
        'grid gap-4',
        {
          'sm:grid-cols-2': columns >= 2,
          'lg:grid-cols-3': columns === 3,
          'lg:grid-cols-4': columns === 4,
        },
        className
      )}
    >
      {children}
    </div>
  );
}
