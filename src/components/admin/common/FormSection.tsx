'use client';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export interface FormSectionProps {
  /** Section title */
  title: string;
  /** Optional description */
  description?: string;
  /** Section content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Collapsible section */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Optional action button in header */
  headerAction?: React.ReactNode;
}

/**
 * Form section with title, description, and consistent styling.
 */
export function FormSection({
  title,
  description,
  children,
  className,
  headerAction,
}: FormSectionProps): React.ReactElement {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="admin-form-section-title">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {headerAction}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export interface FormSectionSeparatorProps {
  className?: string;
}

/**
 * Separator between form sections.
 */
export function FormSectionSeparator({
  className,
}: FormSectionSeparatorProps): React.ReactElement {
  return <Separator className={cn('my-6', className)} />;
}

export interface FormActionsProps {
  /** Primary action button */
  primaryAction: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit';
  };
  /** Secondary/cancel action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  /** Additional actions on the left */
  leftActions?: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Sticky footer */
  sticky?: boolean;
}

/**
 * Form action buttons with consistent layout.
 */
export function FormActions({
  primaryAction,
  secondaryAction,
  leftActions,
  className,
  sticky = false,
}: FormActionsProps): React.ReactElement {
  return (
    <div
      className={cn(
        'admin-form-actions',
        sticky && 'sticky bottom-0 bg-background py-4 -mx-6 px-6 border-t',
        className
      )}
    >
      {leftActions && <div className="mr-auto">{leftActions}</div>}
      {secondaryAction && (
        <Button
          type="button"
          variant="outline"
          onClick={secondaryAction.onClick}
          disabled={secondaryAction.disabled}
        >
          {secondaryAction.label}
        </Button>
      )}
      <Button
        type={primaryAction.type || 'submit'}
        onClick={primaryAction.onClick}
        disabled={primaryAction.disabled || primaryAction.loading}
      >
        {primaryAction.loading ? 'Sparar...' : primaryAction.label}
      </Button>
    </div>
  );
}
