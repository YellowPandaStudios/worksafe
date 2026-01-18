'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  /** Current value(s) */
  value: string | string[] | null;
  /** Change handler */
  onChange: (value: string | string[] | null) => void;
  /** Options to display */
  options?: SelectOption[];
  /** Async options loader */
  loadOptions?: (search: string) => Promise<SelectOption[]>;
  /** Placeholder text */
  placeholder?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Empty state text */
  emptyText?: string;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Allow clearing selection */
  clearable?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Additional className */
  className?: string;
  /** Aria label */
  'aria-label'?: string;
}

/**
 * Searchable select component with async loading support.
 */
export function SearchableSelect({
  value,
  onChange,
  options: staticOptions = [],
  loadOptions,
  placeholder = 'Välj...',
  searchPlaceholder = 'Sök...',
  emptyText = 'Inga resultat hittades',
  multiple = false,
  clearable = false,
  disabled = false,
  loading: externalLoading = false,
  className,
  'aria-label': ariaLabel,
}: SearchableSelectProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<SelectOption[]>(staticOptions);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load options when search changes (for async mode)
  useEffect(() => {
    if (!loadOptions) {
      setOptions(staticOptions);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await loadOptions(search);
        setOptions(results);
      } catch (error) {
        console.error('Failed to load options:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, loadOptions, staticOptions]);

  // Filter static options locally
  const filteredOptions = loadOptions
    ? options
    : options.filter(
        (option) =>
          option.label.toLowerCase().includes(search.toLowerCase()) ||
          option.description?.toLowerCase().includes(search.toLowerCase())
      );

  const selectedValues = multiple
    ? (value as string[] | null) ?? []
    : value
      ? [value as string]
      : [];

  const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (multiple) {
        const currentValues = selectedValues;
        if (currentValues.includes(optionValue)) {
          onChange(currentValues.filter((v) => v !== optionValue));
        } else {
          onChange([...currentValues, optionValue]);
        }
      } else {
        onChange(optionValue === value ? null : optionValue);
        setOpen(false);
      }
    },
    [multiple, onChange, selectedValues, value]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(multiple ? [] : null);
    },
    [multiple, onChange]
  );

  const handleRemove = useCallback(
    (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (multiple) {
        onChange(selectedValues.filter((v) => v !== optionValue));
      }
    },
    [multiple, onChange, selectedValues]
  );

  const isLoading = loading || externalLoading;

  const displayValue = (): React.ReactNode => {
    if (selectedOptions.length === 0) {
      return <span className="text-muted-foreground">{placeholder}</span>;
    }

    if (multiple) {
      return (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <Badge key={option.value} variant="secondary" className="gap-1">
              {option.label}
              <button
                type="button"
                className="ml-1 rounded-full hover:bg-muted"
                onClick={(e) => handleRemove(option.value, e)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      );
    }

    return selectedOptions[0]?.label;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            multiple && selectedOptions.length > 0 && 'h-auto min-h-10',
            className
          )}
        >
          <span className="flex-1 text-left truncate">{displayValue()}</span>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {clearable && selectedOptions.length > 0 && (
              <button
                type="button"
                className="p-0.5 rounded hover:bg-muted"
                onClick={handleClear}
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                Laddar...
              </div>
            ) : filteredOptions.length === 0 ? (
              <CommandEmpty>{emptyText}</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                      disabled={option.disabled}
                    >
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50 [&_svg]:invisible'
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <div className="flex-1">
                        <div>{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
