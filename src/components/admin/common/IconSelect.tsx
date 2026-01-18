'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { icons, type LucideIcon } from 'lucide-react';
import { Search, Smile, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Get all icon names from the icons object (this is the correct way)
const ICON_NAMES = Object.keys(icons);

// Common/popular icons to show first
const POPULAR_ICONS = [
  'Check',
  'X',
  'Plus',
  'Minus',
  'ChevronRight',
  'ChevronDown',
  'ArrowRight',
  'ArrowLeft',
  'Star',
  'Heart',
  'Home',
  'Settings',
  'User',
  'Users',
  'Mail',
  'Phone',
  'Calendar',
  'Clock',
  'Search',
  'Filter',
  'Edit',
  'Trash2',
  'Download',
  'Upload',
  'Share',
  'Link',
  'ExternalLink',
  'Eye',
  'EyeOff',
  'Lock',
  'Unlock',
  'Shield',
  'ShieldCheck',
  'AlertTriangle',
  'AlertCircle',
  'Info',
  'HelpCircle',
  'CheckCircle',
  'XCircle',
  'Flame',
  'Zap',
  'Award',
  'Target',
  'Briefcase',
  'Building',
  'MapPin',
  'Navigation',
  'Truck',
  'Package',
  'Box',
  'FileText',
  'File',
  'Folder',
  'Image',
  'Video',
  'Activity',
  'Stethoscope',
];

interface IconSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Smart icon selector with search and grid display
 */
export function IconSelect({
  value,
  onChange,
  placeholder = 'Ikon',
  className,
}: IconSelectProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get the icon component for the current value
  const SelectedIcon = value ? icons[value as keyof typeof icons] : null;

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      // Show popular icons first, then the rest
      const popularSet = new Set(POPULAR_ICONS);
      const popular = POPULAR_ICONS.filter((name) => ICON_NAMES.includes(name));
      const others = ICON_NAMES.filter((name) => !popularSet.has(name)).sort();
      return [...popular, ...others];
    }

    return ICON_NAMES.filter((name) => name.toLowerCase().includes(query)).sort();
  }, [search]);

  // Reset scroll when search changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [search]);

  const handleSelect = useCallback(
    (iconName: string) => {
      onChange(iconName);
      setOpen(false);
      setSearch('');
    },
    [onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between gap-1.5 font-normal px-2',
            !value && 'text-muted-foreground',
            className
          )}
          title={value || placeholder}
        >
          {SelectedIcon ? (
            <SelectedIcon className="h-4 w-4 shrink-0" />
          ) : (
            <Smile className="h-4 w-4 shrink-0 opacity-50" />
          )}
          <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        {/* Search */}
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sök ikoner..."
              className="pl-8 h-9"
              autoFocus
            />
          </div>
        </div>

        {/* Icon grid */}
        <div
          ref={scrollContainerRef}
          className="max-h-[280px] overflow-y-auto p-2"
        >
          {filteredIcons.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Inga ikoner hittades
            </p>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {filteredIcons.slice(0, 140).map((iconName) => {
                const Icon = icons[iconName as keyof typeof icons];
                if (!Icon) return null;

                const isSelected = value === iconName;

                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleSelect(iconName)}
                    className={cn(
                      'flex items-center justify-center p-2 rounded-md hover:bg-accent transition-colors',
                      isSelected && 'bg-primary text-primary-foreground hover:bg-primary'
                    )}
                    title={iconName}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          )}

          {filteredIcons.length > 140 && (
            <p className="text-xs text-muted-foreground text-center mt-2 pt-2 border-t">
              Visar 140 av {filteredIcons.length}. Sök för fler.
            </p>
          )}
        </div>

        {/* Selected info */}
        {value && (
          <div className="p-2 border-t bg-muted/50 text-xs flex items-center justify-between">
            <span className="text-muted-foreground">
              Vald: <code className="bg-background px-1 py-0.5 rounded">{value}</code>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              Rensa
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/**
 * Render a Lucide icon by name
 */
export function DynamicIcon({
  name,
  className,
  fallback,
}: {
  name: string;
  className?: string;
  fallback?: React.ReactNode;
}): React.ReactElement | null {
  const Icon = icons[name as keyof typeof icons];

  if (!Icon) {
    return fallback ? <>{fallback}</> : null;
  }

  return <Icon className={className} />;
}
