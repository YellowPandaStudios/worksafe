'use client';

import { X, Trash2, Archive, Eye, EyeOff, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface BulkAction {
  /** Action key */
  key: string;
  /** Action label */
  label: string;
  /** Action icon */
  icon?: React.ComponentType<{ className?: string }>;
  /** Action handler */
  onClick: (selectedIds: string[]) => void;
  /** Whether this is a destructive action */
  destructive?: boolean;
  /** Disabled condition */
  disabled?: boolean;
  /** Show in dropdown menu (for secondary actions) */
  inDropdown?: boolean;
}

export interface BulkActionsBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Selected IDs */
  selectedIds: string[];
  /** Available actions */
  actions: BulkAction[];
  /** Clear selection handler */
  onClearSelection: () => void;
  /** Additional className */
  className?: string;
}

/**
 * Bulk actions bar that appears when items are selected.
 */
export function BulkActionsBar({
  selectedCount,
  selectedIds,
  actions,
  onClearSelection,
  className,
}: BulkActionsBarProps): React.ReactElement | null {
  if (selectedCount === 0) return null;

  const primaryActions = actions.filter((a) => !a.inDropdown);
  const dropdownActions = actions.filter((a) => a.inDropdown);

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 p-3 bg-muted rounded-lg border',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSelection}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {selectedCount} {selectedCount === 1 ? 'vald' : 'valda'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {primaryActions.map((action) => (
          <Button
            key={action.key}
            variant={action.destructive ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => action.onClick(selectedIds)}
            disabled={action.disabled}
            className="gap-2"
          >
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label}
          </Button>
        ))}

        {dropdownActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <MoreHorizontal className="h-4 w-4" />
                Fler åtgärder
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {dropdownActions.map((action, index) => (
                <div key={action.key}>
                  {index > 0 && action.destructive && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => action.onClick(selectedIds)}
                    disabled={action.disabled}
                    className={cn(action.destructive && 'text-destructive')}
                  >
                    {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

/**
 * Common bulk actions factory.
 */
export function createCommonBulkActions(handlers: {
  onPublish?: (ids: string[]) => void;
  onUnpublish?: (ids: string[]) => void;
  onArchive?: (ids: string[]) => void;
  onDelete?: (ids: string[]) => void;
  onExport?: (ids: string[]) => void;
}): BulkAction[] {
  const actions: BulkAction[] = [];

  if (handlers.onPublish) {
    actions.push({
      key: 'publish',
      label: 'Publicera',
      icon: Eye,
      onClick: handlers.onPublish,
    });
  }

  if (handlers.onUnpublish) {
    actions.push({
      key: 'unpublish',
      label: 'Avpublicera',
      icon: EyeOff,
      onClick: handlers.onUnpublish,
    });
  }

  if (handlers.onArchive) {
    actions.push({
      key: 'archive',
      label: 'Arkivera',
      icon: Archive,
      onClick: handlers.onArchive,
      inDropdown: true,
    });
  }

  if (handlers.onExport) {
    actions.push({
      key: 'export',
      label: 'Exportera',
      onClick: handlers.onExport,
      inDropdown: true,
    });
  }

  if (handlers.onDelete) {
    actions.push({
      key: 'delete',
      label: 'Ta bort',
      icon: Trash2,
      onClick: handlers.onDelete,
      destructive: true,
      inDropdown: true,
    });
  }

  return actions;
}
