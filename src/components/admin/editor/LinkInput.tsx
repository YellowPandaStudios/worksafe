'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, ChevronDown, Settings2 } from 'lucide-react';
import { LinkPicker } from './LinkPicker';
import { UrlParameterBuilder } from './UrlParameterBuilder';
import { cn } from '@/lib/utils';

interface LinkInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

/**
 * Smart link input that auto-detects link type and provides integrated browsing
 * Shows visual indicators for internal vs external links
 */
export function LinkInput({
  value,
  onChange,
  placeholder = 'Skriv URL eller välj från innehåll',
  id,
  className,
}: LinkInputProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  // Detect link type
  const linkType = useMemo(() => {
    if (!value) return null;
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return 'external';
    }
    if (value.startsWith('/') || value.startsWith('#')) {
      return 'internal';
    }
    // If it looks like a domain, treat as external
    if (value.includes('.') && !value.includes(' ')) {
      return 'external';
    }
    return 'internal';
  }, [value]);

  const LinkIcon = linkType === 'external' ? ExternalLink : FileText;

  return (
    <div className="relative">
      <div className="relative flex items-center">
        {linkType && (
          <div className="absolute left-3 pointer-events-none z-10">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            linkType && 'pl-9 pr-28',
            !linkType && 'pr-28',
            className
          )}
        />
        <div className="absolute right-1 flex items-center gap-1">
          <UrlParameterBuilder url={value || ''} onChange={onChange}>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="h-7 px-2 text-xs hover:bg-accent"
              title="Lägg till parametrar"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Button>
          </UrlParameterBuilder>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPickerOpen(true)}
            type="button"
            className="h-7 px-2 text-xs hover:bg-accent"
            title="Bläddra innehåll"
          >
            <FileText className="h-3.5 w-3.5 mr-1" />
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <LinkPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          onChange(url);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
