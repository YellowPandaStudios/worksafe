'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { ImageIcon, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MediaLibrary } from './MediaLibrary';

interface ImageVariants {
  thumb?: string;
  small?: string;
  medium?: string;
  large?: string;
}

interface MediaItem {
  id: string;
  url: string;
  cdnUrl: string | null;
  filename: string;
  originalName: string | null;
  alt: string | null;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  folder: string;
  variants: ImageVariants | null;
}

interface ImagePickerProps {
  /** Current image URL value */
  value?: string | null;
  /** Callback when image is selected or cleared */
  onChange: (url: string | null, media?: MediaItem) => void;
  /** Folder to filter/upload to */
  folder?: string;
  /** Placeholder text when no image is selected */
  placeholder?: string;
  /** Custom class name */
  className?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Aspect ratio for the preview */
  aspectRatio?: 'square' | 'video' | 'wide';
}

/**
 * Image picker component that opens a media library dialog for selecting images
 */
export function ImagePicker({
  value,
  onChange,
  folder,
  placeholder = 'Välj bild',
  className,
  disabled = false,
  aspectRatio = 'video',
}: ImagePickerProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = useCallback(
    (media: MediaItem) => {
      onChange(media.cdnUrl || media.url, media);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
    },
    [onChange]
  );

  return (
    <>
      <div
        className={cn(
          'group relative rounded-lg border-2 border-dashed overflow-hidden transition-colors',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer hover:border-primary/50',
          value ? 'border-transparent' : 'border-muted-foreground/25',
          className
        )}
        onClick={() => !disabled && setIsOpen(true)}
      >
        {value ? (
          <div className="flex items-center gap-3 p-2">
            {/* Compact image thumbnail */}
            <div className="relative h-16 w-24 shrink-0 rounded-md overflow-hidden bg-muted">
              <Image
                src={value}
                alt="Vald bild"
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>

            {/* Info and actions */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground truncate">Bild vald</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                }}
                disabled={disabled}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={disabled}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* Compact empty state */
          <div className="flex items-center gap-3 p-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          </div>
        )}
      </div>

      {/* Media library dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Välj bild</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            <MediaLibrary
              selectable
              onSelect={handleSelect}
              selectedUrl={value || undefined}
              folder={folder}
              pageSize={18}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
