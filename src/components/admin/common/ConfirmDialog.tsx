'use client';

import { useState, useCallback } from 'react';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info';

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: string;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Confirm handler - can be async */
  onConfirm: () => void | Promise<void>;
  /** Dialog variant */
  variant?: ConfirmDialogVariant;
  /** Loading state */
  loading?: boolean;
}

const variantConfig: Record<
  ConfirmDialogVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconClassName: string;
    actionClassName: string;
  }
> = {
  danger: {
    icon: Trash2,
    iconClassName: 'text-destructive',
    actionClassName: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: 'text-warning',
    actionClassName: 'bg-warning text-warning-foreground hover:bg-warning/90',
  },
  info: {
    icon: Info,
    iconClassName: 'text-primary',
    actionClassName: '',
  },
};

/**
 * Confirmation dialog for destructive or important actions.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Bekräfta',
  cancelLabel = 'Avbryt',
  onConfirm,
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onConfirm, onOpenChange]);

  const showLoading = loading || isLoading;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted',
                config.iconClassName
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={showLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={showLoading}
            className={config.actionClassName}
          >
            {showLoading ? 'Vänta...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook for managing confirm dialog state.
 */
export interface UseConfirmDialogOptions<T = void> {
  title: string;
  description: string | ((data: T) => string);
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: (data: T) => void | Promise<void>;
}

export interface UseConfirmDialogReturn<T = void> {
  dialogProps: Omit<ConfirmDialogProps, 'onConfirm'> & {
    onConfirm: () => void | Promise<void>;
  };
  confirm: (data: T) => void;
}

export function useConfirmDialog<T = void>(
  options: UseConfirmDialogOptions<T>
): UseConfirmDialogReturn<T> {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const confirm = useCallback((confirmData: T) => {
    setData(confirmData);
    setOpen(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (data !== null) {
      await options.onConfirm(data);
    }
  }, [data, options]);

  const description =
    typeof options.description === 'function' && data !== null
      ? options.description(data)
      : typeof options.description === 'string'
        ? options.description
        : '';

  return {
    dialogProps: {
      open,
      onOpenChange: setOpen,
      title: options.title,
      description,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      variant: options.variant,
      onConfirm: handleConfirm,
    },
    confirm,
  };
}
