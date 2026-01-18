'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface FilterOption {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

interface SearchAndFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  className?: string;
}

export function SearchAndFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Sök...',
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  className,
}: SearchAndFilterProps): React.ReactElement {
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);
  const isSyncingRef = useRef(false);

  // Sync local state with prop when it changes externally
  useEffect(() => {
    if (searchValue !== debouncedSearch) {
      isSyncingRef.current = true;
      setDebouncedSearch(searchValue);
      // Reset flag after state update
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 0);
    }
  }, [searchValue, debouncedSearch]);

  // Debounce search - only react to debouncedSearch changes from user input
  useEffect(() => {
    // Skip if this change came from external sync
    if (isSyncingRef.current) {
      return;
    }

    // Only call if the debounced value differs from the current prop value
    if (debouncedSearch === searchValue) {
      return; // Already in sync, no need to update
    }

    const timer = setTimeout(() => {
      onSearchChange(debouncedSearch);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const hasActiveFilters = Object.values(filterValues).some((v) => v && v !== 'all');

  const handleClearFilters = useCallback(() => {
    setDebouncedSearch('');
    onSearchChange('');
    if (onClearFilters) {
      onClearFilters();
    }
  }, [onSearchChange, onClearFilters]);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={debouncedSearch}
            onChange={(e) => setDebouncedSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        {filters.length > 0 && (
          <div className="flex gap-2 shrink-0">
            {filters.map((filter) => (
              <Select
                key={filter.key}
                value={filterValues[filter.key] || 'all'}
                onValueChange={(value) => onFilterChange?.(filter.key, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
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
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="shrink-0"
              >
                <X className="h-4 w-4 mr-1" />
                Rensa
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
