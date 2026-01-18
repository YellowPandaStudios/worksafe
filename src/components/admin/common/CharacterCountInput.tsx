'use client';

import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface CharacterCountInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Maximum character count */
  maxLength: number;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Show warning when approaching limit */
  warningThreshold?: number;
  /** Additional className */
  className?: string;
  /** Container className */
  containerClassName?: string;
}

/**
 * Input with character counter for SEO fields and other length-limited inputs.
 */
export const CharacterCountInput = forwardRef<
  HTMLInputElement,
  CharacterCountInputProps
>(
  (
    {
      maxLength,
      value = '',
      onChange,
      warningThreshold = 0.9,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const currentLength = value.length;
    const isOverLimit = currentLength > maxLength;
    const isWarning = currentLength >= maxLength * warningThreshold;

    return (
      <div className={cn('relative', containerClassName)}>
        <Input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn('pr-16', className)}
          {...props}
        />
        <span
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums',
            isOverLimit
              ? 'text-destructive font-medium'
              : isWarning
                ? 'text-warning'
                : 'text-muted-foreground'
          )}
        >
          {currentLength}/{maxLength}
        </span>
      </div>
    );
  }
);

CharacterCountInput.displayName = 'CharacterCountInput';

export interface CharacterCountTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  /** Maximum character count */
  maxLength: number;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Show warning when approaching limit */
  warningThreshold?: number;
  /** Additional className */
  className?: string;
  /** Container className */
  containerClassName?: string;
}

/**
 * Textarea with character counter.
 */
export const CharacterCountTextarea = forwardRef<
  HTMLTextAreaElement,
  CharacterCountTextareaProps
>(
  (
    {
      maxLength,
      value = '',
      onChange,
      warningThreshold = 0.9,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const currentLength = value.length;
    const isOverLimit = currentLength > maxLength;
    const isWarning = currentLength >= maxLength * warningThreshold;

    return (
      <div className={cn('relative', containerClassName)}>
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn('pr-16', className)}
          {...props}
        />
        <span
          className={cn(
            'absolute right-3 top-2 text-xs tabular-nums',
            isOverLimit
              ? 'text-destructive font-medium'
              : isWarning
                ? 'text-warning'
                : 'text-muted-foreground'
          )}
        >
          {currentLength}/{maxLength}
        </span>
      </div>
    );
  }
);

CharacterCountTextarea.displayName = 'CharacterCountTextarea';

/**
 * SEO-specific input presets.
 */
export interface SEOInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MetaTitleInput({
  value,
  onChange,
  placeholder = 'Meta-titel',
  className,
}: SEOInputProps): React.ReactElement {
  return (
    <CharacterCountInput
      value={value}
      onChange={onChange}
      maxLength={60}
      placeholder={placeholder}
      className={className}
    />
  );
}

export function MetaDescriptionTextarea({
  value,
  onChange,
  placeholder = 'Meta-beskrivning',
  className,
}: SEOInputProps & { rows?: number }): React.ReactElement {
  return (
    <CharacterCountTextarea
      value={value}
      onChange={onChange}
      maxLength={160}
      placeholder={placeholder}
      rows={3}
      className={className}
    />
  );
}
