'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Back link configuration */
  backLink?: {
    href: string;
    label?: string;
  };
  /** Action buttons on the right side */
  actions?: React.ReactNode;
  /** Additional className for the header container */
  className?: string;
  /** Optional badge/status next to title */
  badge?: React.ReactNode;
}

/**
 * Consistent page header for admin pages.
 * Includes title, optional description, back link, and action buttons.
 */
export function PageHeader({
  title,
  description,
  backLink,
  actions,
  className,
  badge,
}: PageHeaderProps): React.ReactElement {
  return (
    <div className={cn('admin-page-header-responsive', className)}>
      <div className="min-w-0 flex-1">
        {backLink && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Link href={backLink.href}>
              <ArrowLeft className="icon-sm icon-button-left" />
              {backLink.label || 'Tillbaka'}
            </Link>
          </Button>
        )}
        <div className="flex items-center gap-3">
          <h1 className="admin-page-title truncate">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="admin-page-description mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="admin-actions-responsive shrink-0">{actions}</div>
      )}
    </div>
  );
}
