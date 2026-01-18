'use client';

import { cn } from '@/lib/utils';
import { PageHeader, type PageHeaderProps } from '../common/PageHeader';

export interface EditPageLayoutProps {
  /** Page title */
  title: string;
  /** Back navigation */
  backHref: string;
  backLabel?: string;
  /** Optional badge next to title (e.g., status) */
  badge?: React.ReactNode;
  /** Action buttons in header */
  actions?: React.ReactNode;
  /** Optional description below title */
  description?: string;
  /** Main content */
  children: React.ReactNode;
  /** Layout variant for different content types */
  variant?: 'narrow' | 'default' | 'wide' | 'full';
  /** Additional className */
  className?: string;
  /** Custom header component (replaces default PageHeader) */
  customHeader?: React.ReactNode;
}

const variantClasses: Record<NonNullable<EditPageLayoutProps['variant']>, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-5xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
};

/**
 * Standardized layout for edit/create admin pages.
 * Provides consistent header, width constraints, and spacing.
 *
 * @example
 * ```tsx
 * <EditPageLayout
 *   title="Redigera: Brandskydd"
 *   backHref="/admin/services"
 *   badge={<StatusBadge status="draft" />}
 *   actions={<Button>Spara</Button>}
 *   variant="narrow"
 * >
 *   <ServiceForm />
 * </EditPageLayout>
 * ```
 */
export function EditPageLayout({
  title,
  backHref,
  backLabel = 'Tillbaka',
  badge,
  actions,
  description,
  children,
  variant = 'default',
  className,
  customHeader,
}: EditPageLayoutProps): React.ReactElement {
  return (
    <div className={cn('admin-page', variantClasses[variant], className)}>
      {customHeader || (
        <PageHeader
          title={title}
          description={description}
          backLink={{ href: backHref, label: backLabel }}
          badge={badge}
          actions={actions}
        />
      )}
      <div className="mt-6">{children}</div>
    </div>
  );
}

export interface EditPageLayoutWithEditorProps {
  /** Main content (the form) */
  children: React.ReactNode;
  /** Layout variant */
  variant?: 'narrow' | 'default' | 'wide' | 'full';
  /** Additional className */
  className?: string;
}

/**
 * Simplified layout for pages that use ContentEditorHeader inside their form.
 * Just provides the container and spacing, form provides its own header.
 *
 * @example
 * ```tsx
 * <EditPageLayoutWithEditor variant="default">
 *   <ServiceForm initialData={service} />
 * </EditPageLayoutWithEditor>
 * ```
 */
export function EditPageLayoutWithEditor({
  children,
  variant = 'default',
  className,
}: EditPageLayoutWithEditorProps): React.ReactElement {
  return (
    <div className={cn('admin-page', variantClasses[variant], className)}>
      {children}
    </div>
  );
}
