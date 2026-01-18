'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PageHeader } from '../common/PageHeader';
import { EmptyState, type EmptyStateProps } from '../common/EmptyState';
import { StatCard, StatCardGrid, type StatCardProps } from '../common/StatCard';

export interface ListPageLayoutProps {
  /** Page title */
  title: string;
  /** Optional description */
  description?: string;
  /** Create new item link */
  createHref?: string;
  /** Create button label */
  createLabel?: string;
  /** Additional header actions */
  headerActions?: React.ReactNode;
  /** Stats cards to display above content */
  stats?: StatCardProps[];
  /** Search and filter toolbar */
  toolbar?: React.ReactNode;
  /** Main content (typically DataTable or card grid) */
  children: React.ReactNode;
  /** Show empty state when no data */
  isEmpty?: boolean;
  /** Empty state configuration */
  emptyState?: Omit<EmptyStateProps, 'action'> & {
    createLabel?: string;
  };
  /** Additional className */
  className?: string;
}

/**
 * Standardized layout for list/index admin pages.
 * Provides consistent header with create button, optional stats, toolbar, and content area.
 *
 * @example
 * ```tsx
 * <ListPageLayout
 *   title="Tjänster"
 *   createHref="/admin/services/new"
 *   createLabel="Ny tjänst"
 *   stats={[
 *     { label: 'Totalt', value: 24 },
 *     { label: 'Publicerade', value: 18 },
 *   ]}
 *   toolbar={<ServiceFilters />}
 *   isEmpty={services.length === 0}
 *   emptyState={{
 *     title: 'Inga tjänster än',
 *     description: 'Skapa din första tjänst för att komma igång.',
 *   }}
 * >
 *   <ServicesList services={services} />
 * </ListPageLayout>
 * ```
 */
export function ListPageLayout({
  title,
  description,
  createHref,
  createLabel = 'Skapa ny',
  headerActions,
  stats,
  toolbar,
  children,
  isEmpty = false,
  emptyState,
  className,
}: ListPageLayoutProps): React.ReactElement {
  // Build the actions section
  const actions = (
    <div className="flex items-center gap-2">
      {headerActions}
      {createHref && (
        <Button asChild>
          <Link href={createHref}>
            <Plus className="h-4 w-4 mr-2" />
            {createLabel}
          </Link>
        </Button>
      )}
    </div>
  );

  return (
    <div className={cn('admin-page', className)}>
      <PageHeader title={title} description={description} actions={actions} />

      {/* Stats Section */}
      {stats && stats.length > 0 && (
        <div className="mt-6">
          <StatCardGrid>
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </StatCardGrid>
        </div>
      )}

      {/* Toolbar Section (Search, Filters) */}
      {toolbar && <div className="mt-6">{toolbar}</div>}

      {/* Content Section */}
      <div className="mt-6">
        {isEmpty && emptyState ? (
          <EmptyState
            {...emptyState}
            action={
              createHref
                ? {
                    label: emptyState.createLabel || createLabel,
                    href: createHref,
                  }
                : undefined
            }
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export interface ListPageSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Section content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Optional section wrapper for grouping content within a list page.
 */
export function ListPageSection({
  title,
  description,
  children,
  className,
}: ListPageSectionProps): React.ReactElement {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div>
          {title && (
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
