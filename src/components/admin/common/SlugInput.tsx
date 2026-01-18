'use client';

import { useState, useCallback, useEffect } from 'react';
import { Pencil, RefreshCw, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { slugify } from '@/lib/slugify';

export interface SlugInputProps {
  /** Current slug value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Source value to generate slug from (e.g., title) */
  sourceValue?: string;
  /** Base path to show before slug */
  basePath?: string;
  /** Whether this is a new item (auto-generate) or existing (manual edit) */
  isNew?: boolean;
  /** Disable editing */
  disabled?: boolean;
  /** Validation error */
  error?: string;
  /** Additional className */
  className?: string;
}

/**
 * Slug input with auto-generation and manual editing.
 */
export function SlugInput({
  value,
  onChange,
  sourceValue = '',
  basePath = '',
  isNew = true,
  disabled = false,
  error,
  className,
}: SlugInputProps): React.ReactElement {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [hasBeenManuallyEdited, setHasBeenManuallyEdited] = useState(false);

  // Sync local value with prop
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Auto-generate slug from source when new and not manually edited
  useEffect(() => {
    if (isNew && sourceValue && !hasBeenManuallyEdited && !isEditing) {
      const generatedSlug = slugify(sourceValue);
      if (generatedSlug && generatedSlug !== value) {
        onChange(generatedSlug);
      }
    }
  }, [sourceValue, isNew, hasBeenManuallyEdited, isEditing, onChange, value]);

  const handleStartEditing = useCallback(() => {
    setIsEditing(true);
    setLocalValue(value);
  }, [value]);

  const handleConfirm = useCallback(() => {
    const normalizedSlug = slugify(localValue) || localValue;
    onChange(normalizedSlug);
    setHasBeenManuallyEdited(true);
    setIsEditing(false);
  }, [localValue, onChange]);

  const handleCancel = useCallback(() => {
    setLocalValue(value);
    setIsEditing(false);
  }, [value]);

  const handleRegenerate = useCallback(() => {
    if (sourceValue) {
      const generatedSlug = slugify(sourceValue);
      onChange(generatedSlug);
      setHasBeenManuallyEdited(false);
    }
  }, [sourceValue, onChange]);

  const fullPath = basePath ? `${basePath}/${value}` : `/${value}`;

  if (isEditing) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex gap-2">
          <Input
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            placeholder="slug"
            className="flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirm();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleConfirm}
            className="shrink-0"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm truncate">
          {fullPath || '/'}
        </code>
        {!disabled && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleStartEditing}
              className="shrink-0 h-8 w-8"
              title="Redigera slug"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {sourceValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRegenerate}
                className="shrink-0 h-8 w-8"
                title="Generera från titel"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            )}
          </>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

/**
 * Simple slug preview component.
 */
export interface SlugPreviewProps {
  basePath?: string;
  slug?: string;
  className?: string;
}

export function SlugPreview({
  basePath = '',
  slug = '',
  className,
}: SlugPreviewProps): React.ReactElement | null {
  if (!slug) return null;

  const fullPath = basePath ? `${basePath}/${slug}` : `/${slug}`;

  return (
    <div className={cn('text-sm text-muted-foreground', className)}>
      URL:{' '}
      <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{fullPath}</code>
    </div>
  );
}
