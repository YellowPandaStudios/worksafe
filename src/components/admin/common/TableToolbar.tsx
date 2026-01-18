'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  /** Filter key */
  key: string;
  /** Filter label */
  label: string;
  /** Filter options */
  options: FilterOption[];
  /** Placeholder */
  placeholder?: string;
}

export interface TableToolbarProps {
  /** Search query */
  searchQuery?: string;
  /** Search change handler */
  onSearchChange?: (query: string) => void;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Filter configurations */
  filters?: FilterConfig[];
  /** Current filter values */
  filterValues?: Record<string, string>;
  /** Filter change handler */
  onFilterChange?: (key: string, value: string) => void;
  /** Clear all filters handler */
  onClearFilters?: () => void;
  /** Refresh handler */
  onRefresh?: () => void;
  /** Is refreshing */
  isRefreshing?: boolean;
  /** Left-side actions (bulk actions, etc.) */
  leftActions?: React.ReactNode;
  /** Right-side actions (add button, etc.) */
  rightActions?: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Table toolbar with search, filters, and actions.
 */
export function TableToolbar({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Sök...',
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  onRefresh,
  isRefreshing = false,
  leftActions,
  rightActions,
  className,
}: TableToolbarProps): React.ReactElement {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local search with prop
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onSearchChange?.(value);
      }, 300);
    },
    [onSearchChange]
  );

  const handleClearSearch = useCallback(() => {
    setLocalSearch('');
    onSearchChange?.('');
  }, [onSearchChange]);

  const activeFilterCount = Object.values(filterValues).filter(
    (v) => v && v !== 'all'
  ).length;

  const hasActiveFilters = activeFilterCount > 0 || searchQuery;

  return (
    <div className={cn('admin-table-toolbar', className)}>
      <div className="flex items-center gap-2 flex-1">
        {leftActions}

        {/* Search */}
        {onSearchChange && (
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-9"
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Filters */}
        {filters.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filter
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Filter</h4>
                  {hasActiveFilters && onClearFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearFilters}
                      className="h-auto py-1 px-2 text-xs"
                    >
                      Rensa alla
                    </Button>
                  )}
                </div>
                {filters.map((filter) => (
                  <div key={filter.key} className="space-y-2">
                    <label className="text-sm font-medium">{filter.label}</label>
                    <Select
                      value={filterValues[filter.key] || 'all'}
                      onValueChange={(value) =>
                        onFilterChange?.(filter.key, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={filter.placeholder || 'Välj...'}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alla</SelectItem>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Inline filters (visible on desktop) */}
        {filters.length > 0 && filters.length <= 2 && (
          <div className="hidden md:flex items-center gap-2">
            {filters.map((filter) => (
              <Select
                key={filter.key}
                value={filterValues[filter.key] || 'all'}
                onValueChange={(value) => onFilterChange?.(filter.key, value)}
              >
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla {filter.label.toLowerCase()}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Refresh */}
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 w-9"
          >
            <RefreshCw
              className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
            />
          </Button>
        )}

        {rightActions}
      </div>
    </div>
  );
}

/**
 * Active filters display component.
 */
export interface ActiveFiltersProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onRemove: (key: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function ActiveFilters({
  filters,
  values,
  onRemove,
  onClearAll,
  className,
}: ActiveFiltersProps): React.ReactElement | null {
  const activeFilters = filters.filter(
    (f) => values[f.key] && values[f.key] !== 'all'
  );

  if (activeFilters.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span className="text-sm text-muted-foreground">Aktiva filter:</span>
      {activeFilters.map((filter) => {
        const option = filter.options.find((o) => o.value === values[filter.key]);
        return (
          <Badge key={filter.key} variant="secondary" className="gap-1">
            {filter.label}: {option?.label || values[filter.key]}
            <button
              type="button"
              onClick={() => onRemove(filter.key)}
              className="ml-1 hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-6 px-2 text-xs"
      >
        Rensa alla
      </Button>
    </div>
  );
}
