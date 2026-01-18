'use client';

import Link from 'next/link';
import { MoreHorizontal, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface DataCardAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
  separator?: boolean;
}

export interface DataCardProps {
  /** Card title */
  title: string;
  /** Card subtitle/description */
  subtitle?: string;
  /** Image URL */
  image?: string | null;
  /** Image alt text */
  imageAlt?: string;
  /** Status badge */
  status?: React.ReactNode;
  /** Metadata items */
  meta?: React.ReactNode;
  /** Card actions */
  actions?: DataCardAction[];
  /** Click handler (makes card clickable) */
  onClick?: () => void;
  /** Link href (makes card a link) */
  href?: string;
  /** External link */
  external?: boolean;
  /** Additional className */
  className?: string;
  /** Loading state */
  loading?: boolean;
}

/**
 * Data card for displaying items in grid/list layouts.
 */
export function DataCard({
  title,
  subtitle,
  image,
  imageAlt,
  status,
  meta,
  actions,
  onClick,
  href,
  external,
  className,
  loading = false,
}: DataCardProps): React.ReactElement {
  const hasActions = actions && actions.length > 0;
  const isClickable = onClick || href;

  const content = (
    <>
      {/* Image */}
      {image !== undefined && (
        <div className="card-image">
          {loading ? (
            <Skeleton className="absolute inset-0" />
          ) : image ? (
            <img
              src={image}
              alt={imageAlt || title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Ingen bild</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {loading ? (
              <>
                <Skeleton className="h-5 w-3/4 mb-2" />
                {subtitle !== undefined && <Skeleton className="h-4 w-1/2" />}
              </>
            ) : (
              <>
                <h3 className="font-medium text-sm truncate">{title}</h3>
                {subtitle && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {subtitle}
                  </p>
                )}
              </>
            )}
          </div>

          {hasActions && !loading && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 -mr-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, index) => (
                  <div key={action.label}>
                    {action.separator && index > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick?.();
                      }}
                      asChild={!!action.href}
                      className={cn(action.destructive && 'text-destructive')}
                    >
                      {action.href ? (
                        <Link href={action.href}>
                          {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                          {action.label}
                        </Link>
                      ) : (
                        <>
                          {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                          {action.label}
                        </>
                      )}
                    </DropdownMenuItem>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Status and meta */}
        {(status || meta) && !loading && (
          <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t">
            {status && <div>{status}</div>}
            {meta && (
              <div className="text-xs text-muted-foreground">{meta}</div>
            )}
          </div>
        )}
      </div>
    </>
  );

  const cardClassName = cn(
    'rounded-lg border bg-card overflow-hidden',
    isClickable && 'cursor-pointer hover:border-primary/50 transition-colors',
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cardClassName}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {content}
        {external && (
          <ExternalLink className="absolute top-2 right-2 h-4 w-4 text-muted-foreground" />
        )}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div className={cardClassName} onClick={onClick}>
        {content}
      </div>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}

/**
 * Grid container for data cards.
 */
export interface DataCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function DataCardGrid({
  children,
  columns = 3,
  className,
}: DataCardGridProps): React.ReactElement {
  return (
    <div
      className={cn(
        'grid gap-4',
        {
          'sm:grid-cols-2': columns >= 2,
          'lg:grid-cols-3': columns >= 3,
          'xl:grid-cols-4': columns >= 4,
          '2xl:grid-cols-5': columns === 5,
        },
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Loading skeleton for data card grid.
 */
export function DataCardGridSkeleton({
  count = 6,
  columns = 3,
  showImage = true,
}: {
  count?: number;
  columns?: DataCardGridProps['columns'];
  showImage?: boolean;
}): React.ReactElement {
  return (
    <DataCardGrid columns={columns}>
      {Array.from({ length: count }).map((_, i) => (
        <DataCard
          key={i}
          title=""
          subtitle={showImage ? '' : undefined}
          image={showImage ? null : undefined}
          loading
        />
      ))}
    </DataCardGrid>
  );
}
