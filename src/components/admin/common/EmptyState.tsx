'use client';

import { FolderOpen, Search, FileQuestion, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
  };
  /** Secondary action */
  secondaryAction?: {
    label: string;
    onClick?: () => void;
  };
  /** Variant for different contexts */
  variant?: 'default' | 'search' | 'error' | 'compact';
  /** Additional className */
  className?: string;
}

const defaultIcons: Record<string, React.ReactNode> = {
  default: <FolderOpen className="h-12 w-12" />,
  search: <Search className="h-12 w-12" />,
  error: <FileQuestion className="h-12 w-12" />,
  compact: <FolderOpen className="h-8 w-8" />,
};

/**
 * Empty state component for when there's no data to display.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  className,
}: EmptyStateProps): React.ReactElement {
  const isCompact = variant === 'compact';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        isCompact ? 'py-8' : 'py-12',
        className
      )}
    >
      <div
        className={cn(
          'text-muted-foreground',
          isCompact ? 'mb-2' : 'mb-4'
        )}
      >
        {icon || defaultIcons[variant]}
      </div>
      <h3
        className={cn(
          'font-semibold text-text-primary',
          isCompact ? 'text-sm mb-1' : 'text-lg mb-2'
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            'text-muted-foreground max-w-sm',
            isCompact ? 'text-xs mb-3' : 'text-sm mb-6'
          )}
        >
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button
              size={isCompact ? 'sm' : 'default'}
              onClick={action.onClick}
              asChild={!!action.href}
            >
              {action.href ? (
                <a href={action.href}>
                  {action.icon || <Plus className="h-4 w-4 mr-1" />}
                  {action.label}
                </a>
              ) : (
                <>
                  {action.icon || <Plus className="h-4 w-4 mr-1" />}
                  {action.label}
                </>
              )}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              size={isCompact ? 'sm' : 'default'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Search-specific empty state.
 */
export function SearchEmptyState({
  searchTerm,
  onClearSearch,
  className,
}: {
  searchTerm?: string;
  onClearSearch?: () => void;
  className?: string;
}): React.ReactElement {
  return (
    <EmptyState
      variant="search"
      title="Inga resultat hittades"
      description={
        searchTerm
          ? `Inga resultat matchade "${searchTerm}". Försök med andra sökord.`
          : 'Försök med andra sökord eller filter.'
      }
      secondaryAction={
        onClearSearch
          ? { label: 'Rensa sökning', onClick: onClearSearch }
          : undefined
      }
      className={className}
    />
  );
}
