'use client';

import { useState, useMemo, useCallback } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  /** Unique column identifier */
  id: string;
  /** Column header label */
  header: string;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Custom cell renderer */
  cell?: (row: T) => React.ReactNode;
  /** Access the value for sorting/default display */
  accessorKey?: keyof T;
  /** Column width class */
  className?: string;
  /** Hide column on mobile */
  hideOnMobile?: boolean;
}

export interface RowAction<T> {
  /** Action label */
  label: string;
  /** Icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Action handler */
  onClick: (row: T) => void;
  /** Whether this is a destructive action */
  destructive?: boolean;
  /** Separator before this action */
  separator?: boolean;
  /** Disable condition */
  disabled?: (row: T) => boolean;
  /** Hide condition */
  hidden?: (row: T) => boolean;
}

export interface DataTableAdvancedProps<T extends { id: string }> {
  /** Data rows */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Enable row selection */
  selectable?: boolean;
  /** Currently selected row IDs */
  selectedIds?: string[];
  /** Selection change handler */
  onSelectionChange?: (ids: string[]) => void;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Row actions dropdown */
  rowActions?: RowAction<T>[];
  /** Current sort column */
  sortColumn?: string | null;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Sort change handler */
  onSortChange?: (column: string, direction: SortDirection) => void;
  /** Loading state */
  loading?: boolean;
  /** Number of skeleton rows when loading */
  skeletonRows?: number;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state icon */
  emptyIcon?: React.ReactNode;
  /** Empty state action */
  emptyAction?: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Get row key (defaults to row.id) */
  getRowId?: (row: T) => string;
}

/**
 * Advanced data table with selection, sorting, row actions, and loading states.
 */
export function DataTableAdvanced<T extends { id: string }>({
  data,
  columns,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  rowActions,
  sortColumn = null,
  sortDirection = null,
  onSortChange,
  loading = false,
  skeletonRows = 5,
  emptyMessage = 'Inga resultat hittades',
  emptyIcon,
  emptyAction,
  className,
  getRowId = (row) => row.id,
}: DataTableAdvancedProps<T>): React.ReactElement {
  const [internalSort, setInternalSort] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: sortColumn, direction: sortDirection });

  const currentSortColumn = sortColumn ?? internalSort.column;
  const currentSortDirection = sortDirection ?? internalSort.direction;

  const handleSort = useCallback(
    (columnId: string) => {
      let newDirection: SortDirection = 'asc';
      if (currentSortColumn === columnId) {
        if (currentSortDirection === 'asc') newDirection = 'desc';
        else if (currentSortDirection === 'desc') newDirection = null;
      }

      if (onSortChange) {
        onSortChange(columnId, newDirection);
      } else {
        setInternalSort({ column: columnId, direction: newDirection });
      }
    },
    [currentSortColumn, currentSortDirection, onSortChange]
  );

  // Sort data internally if no external handler
  const sortedData = useMemo(() => {
    if (!currentSortColumn || !currentSortDirection || onSortChange) {
      return data;
    }

    const column = columns.find((c) => c.id === currentSortColumn);
    if (!column?.accessorKey) return data;

    return [...data].sort((a, b) => {
      const aValue = a[column.accessorKey as keyof T];
      const bValue = b[column.accessorKey as keyof T];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (aValue instanceof Date && bValue instanceof Date) {
        return currentSortDirection === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return currentSortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);
      return currentSortDirection === 'asc'
        ? aStr.localeCompare(bStr, 'sv')
        : bStr.localeCompare(aStr, 'sv');
    });
  }, [data, currentSortColumn, currentSortDirection, columns, onSortChange]);

  // Selection helpers
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(getRowId));
    }
  }, [allSelected, data, getRowId, onSelectionChange]);

  const handleSelectRow = useCallback(
    (rowId: string) => {
      if (!onSelectionChange) return;
      if (selectedIds.includes(rowId)) {
        onSelectionChange(selectedIds.filter((id) => id !== rowId));
      } else {
        onSelectionChange([...selectedIds, rowId]);
      }
    },
    [selectedIds, onSelectionChange]
  );

  const renderCell = (column: ColumnDef<T>, row: T): React.ReactNode => {
    if (column.cell) {
      return column.cell(row);
    }
    if (column.accessorKey) {
      const value = row[column.accessorKey];
      if (value instanceof Date) {
        return value.toLocaleDateString('sv-SE');
      }
      return String(value ?? '-');
    }
    return '-';
  };

  const showRowActions = rowActions && rowActions.length > 0;

  return (
    <div className={cn('admin-table-wrapper', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={someSelected ? 'indeterminate' : allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Markera alla"
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={cn(
                  column.className,
                  column.sortable && 'cursor-pointer select-none',
                  column.hideOnMobile && 'hidden md:table-cell'
                )}
                onClick={() => column.sortable && handleSort(column.id)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && (
                    <span className="inline-flex">
                      {currentSortColumn === column.id ? (
                        currentSortDirection === 'asc' ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : currentSortDirection === 'desc' ? (
                          <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
            {showRowActions && <TableHead className="w-12" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            // Loading skeleton
            Array.from({ length: skeletonRows }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                {selectable && (
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn(column.hideOnMobile && 'hidden md:table-cell')}
                  >
                    <Skeleton className="h-4 w-full max-w-[200px]" />
                  </TableCell>
                ))}
                {showRowActions && (
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : sortedData.length === 0 ? (
            // Empty state
            <TableRow>
              <TableCell
                colSpan={
                  columns.length + (selectable ? 1 : 0) + (showRowActions ? 1 : 0)
                }
              >
                <div className="admin-empty py-12">
                  {emptyIcon && <div className="admin-empty-icon">{emptyIcon}</div>}
                  <p className="admin-empty-title">{emptyMessage}</p>
                  {emptyAction && <div className="mt-4">{emptyAction}</div>}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            // Data rows
            sortedData.map((row) => {
              const rowId = getRowId(row);
              const isSelected = selectedIds.includes(rowId);

              return (
                <TableRow
                  key={rowId}
                  onClick={() => !selectable && onRowClick?.(row)}
                  className={cn(
                    onRowClick && !selectable && 'cursor-pointer',
                    isSelected && 'bg-muted/50'
                  )}
                  data-state={isSelected ? 'selected' : undefined}
                >
                  {selectable && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectRow(rowId)}
                        aria-label={`Markera rad`}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(
                        column.className,
                        column.hideOnMobile && 'hidden md:table-cell'
                      )}
                      onClick={() => selectable && onRowClick?.(row)}
                    >
                      {renderCell(column, row)}
                    </TableCell>
                  ))}
                  {showRowActions && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <RowActionsMenu row={row} actions={rowActions} />
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

interface RowActionsMenuProps<T> {
  row: T;
  actions: RowAction<T>[];
}

function RowActionsMenu<T>({
  row,
  actions,
}: RowActionsMenuProps<T>): React.ReactElement {
  const visibleActions = actions.filter((action) => !action.hidden?.(row));

  if (visibleActions.length === 0) return <></>;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Öppna meny</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {visibleActions.map((action, index) => (
          <div key={action.label}>
            {action.separator && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => action.onClick(row)}
              disabled={action.disabled?.(row)}
              className={cn(action.destructive && 'text-destructive')}
            >
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
