'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface TablePaginationProps {
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total number of items */
  totalItems: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Page size change handler */
  onPageSizeChange?: (pageSize: number) => void;
  /** Available page sizes */
  pageSizeOptions?: number[];
  /** Show page size selector */
  showPageSize?: boolean;
  /** Show total count */
  showTotal?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Table pagination component.
 */
export function TablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSize = true,
  showTotal = true,
  className,
}: TablePaginationProps): React.ReactElement {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div
      className={cn(
        'admin-table-pagination',
        className
      )}
    >
      {/* Left side: Page size and total */}
      <div className="flex items-center gap-4">
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Visa</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per sida</span>
          </div>
        )}

        {showTotal && totalItems > 0 && (
          <span className="text-sm text-muted-foreground">
            Visar {startItem}–{endItem} av {totalItems}
          </span>
        )}
      </div>

      {/* Right side: Navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">Första sidan</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Föregående sida</span>
        </Button>

        {/* Page indicator */}
        <div className="flex items-center gap-1 px-2">
          <span className="text-sm">
            Sida {page} av {totalPages || 1}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Nästa sida</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Sista sidan</span>
        </Button>
      </div>
    </div>
  );
}

/**
 * Hook for managing pagination state.
 */
export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems: number;
}

export interface UsePaginationReturn {
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  paginationProps: Pick<
    TablePaginationProps,
    'page' | 'pageSize' | 'totalItems' | 'onPageChange' | 'onPageSizeChange'
  >;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 20,
  totalItems,
}: UsePaginationOptions): UsePaginationReturn {
  const [page, setPageState] = React.useState(initialPage);
  const [pageSize, setPageSizeState] = React.useState(initialPageSize);

  const totalPages = Math.ceil(totalItems / pageSize);
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  const setPage = React.useCallback(
    (newPage: number) => {
      setPageState(Math.max(1, Math.min(newPage, totalPages || 1)));
    },
    [totalPages]
  );

  const setPageSize = React.useCallback(
    (newPageSize: number) => {
      setPageSizeState(newPageSize);
      // Reset to first page when changing page size
      setPageState(1);
    },
    []
  );

  const nextPage = React.useCallback(() => {
    if (canGoNext) setPage(page + 1);
  }, [canGoNext, page, setPage]);

  const previousPage = React.useCallback(() => {
    if (canGoPrevious) setPage(page - 1);
  }, [canGoPrevious, page, setPage]);

  return {
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    canGoPrevious,
    canGoNext,
    paginationProps: {
      page,
      pageSize,
      totalItems,
      onPageChange: setPage,
      onPageSizeChange: setPageSize,
    },
  };
}

// Import React for the hook
import * as React from 'react';
