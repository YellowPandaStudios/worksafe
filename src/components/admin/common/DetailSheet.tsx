'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface DetailSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Called when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Sheet title */
  title: string;
  /** Optional description */
  description?: string;
  /** Sheet content */
  children: React.ReactNode;
  /** Footer actions */
  footer?: React.ReactNode;
  /** Sheet side */
  side?: 'left' | 'right';
  /** Sheet size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional className */
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
};

/**
 * Side sheet for viewing details or quick edits.
 */
export function DetailSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = 'right',
  size = 'md',
  className,
}: DetailSheetProps): React.ReactElement {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn('flex flex-col', sizeClasses[size], className)}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4">{children}</div>
        {footer && (
          <>
            <Separator />
            <SheetFooter className="pt-4">{footer}</SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/**
 * Detail item for displaying label-value pairs.
 */
export interface DetailItemProps {
  /** Label */
  label: string;
  /** Value */
  value: React.ReactNode;
  /** Additional className */
  className?: string;
}

export function DetailItem({
  label,
  value,
  className,
}: DetailItemProps): React.ReactElement {
  return (
    <div className={cn('space-y-1', className)}>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value ?? '-'}</dd>
    </div>
  );
}

/**
 * Grid container for detail items.
 */
export interface DetailGridProps {
  children: React.ReactNode;
  columns?: 1 | 2;
  className?: string;
}

export function DetailGrid({
  children,
  columns = 1,
  className,
}: DetailGridProps): React.ReactElement {
  return (
    <dl
      className={cn(
        'space-y-4',
        columns === 2 && 'grid grid-cols-2 gap-4 space-y-0',
        className
      )}
    >
      {children}
    </dl>
  );
}

/**
 * Section divider for detail sheets.
 */
export interface DetailSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function DetailSection({
  title,
  children,
  className,
}: DetailSectionProps): React.ReactElement {
  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-semibold">{title}</h4>
      {children}
    </div>
  );
}
