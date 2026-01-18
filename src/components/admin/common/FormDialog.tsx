'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FormDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Optional description */
  description?: string;
  /** Form content */
  children: React.ReactNode;
  /** Submit button label */
  submitLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Submit handler */
  onSubmit: () => void | Promise<void>;
  /** Loading state */
  loading?: boolean;
  /** Disable submit button */
  submitDisabled?: boolean;
  /** Dialog size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Additional content className */
  contentClassName?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
  full: 'sm:max-w-[90vw]',
};

/**
 * Dialog component for forms with consistent layout.
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  submitLabel = 'Spara',
  cancelLabel = 'Avbryt',
  onSubmit,
  loading = false,
  submitDisabled = false,
  size = 'md',
  contentClassName,
}: FormDialogProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const showLoading = loading || isLoading;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        await onSubmit();
        onOpenChange(false);
      } catch (error) {
        console.error('Form submit failed:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [onSubmit, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(sizeClasses[size], contentClassName)}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="py-4">{children}</div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={showLoading}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={showLoading || submitDisabled}>
              {showLoading ? 'Sparar...' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook for managing form dialog state.
 */
export interface UseFormDialogOptions<T = void> {
  title: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  size?: FormDialogProps['size'];
  onSubmit: (data: T) => void | Promise<void>;
}

export interface UseFormDialogReturn<T = void> {
  open: boolean;
  data: T | null;
  openDialog: (data: T) => void;
  closeDialog: () => void;
  dialogProps: Pick<
    FormDialogProps,
    'open' | 'onOpenChange' | 'title' | 'description' | 'submitLabel' | 'cancelLabel' | 'size'
  > & {
    onSubmit: () => void | Promise<void>;
  };
}

export function useFormDialog<T = void>(
  options: UseFormDialogOptions<T>
): UseFormDialogReturn<T> {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const openDialog = useCallback((dialogData: T) => {
    setData(dialogData);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setData(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (data !== null) {
      await options.onSubmit(data);
    }
  }, [data, options]);

  return {
    open,
    data,
    openDialog,
    closeDialog,
    dialogProps: {
      open,
      onOpenChange: setOpen,
      title: options.title,
      description: options.description,
      submitLabel: options.submitLabel,
      cancelLabel: options.cancelLabel,
      size: options.size,
      onSubmit: handleSubmit,
    },
  };
}
