'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface LightboxImage {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  metadata?: {
    filename?: string;
    size?: number;
    dimensions?: string;
    [key: string]: string | number | undefined;
  };
}

interface ImageLightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  className?: string;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

/**
 * Full-screen image lightbox component with zoom and pan
 */
export function ImageLightbox({
  images,
  initialIndex = 0,
  open,
  onClose,
  className,
}: ImageLightboxProps): React.ReactElement | null {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when opening or changing image
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Reset when opening
  useEffect(() => {
    if (open) {
      resetView();
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, initialIndex, resetView]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    resetView();
  }, [images.length, resetView]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    resetView();
  }, [images.length, resetView]);

  // Zoom with constraints
  const handleZoom = useCallback((delta: number) => {
    setZoom((z) => {
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta));
      // Reset pan when zooming out to 1 or below
      if (newZoom <= 1) {
        setPan({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    handleZoom(delta);
  }, [handleZoom]);

  // Pan/drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, zoom, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoom(ZOOM_STEP);
          break;
        case '-':
          e.preventDefault();
          handleZoom(-ZOOM_STEP);
          break;
        case '0':
          e.preventDefault();
          resetView();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, goToPrevious, goToNext, handleZoom, resetView]);

  if (!open || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm',
        className
      )}
      onClick={onClose}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50 text-background hover:bg-background/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
        <span className="sr-only">Stäng</span>
      </Button>

      {/* Navigation buttons */}
      {hasMultiple && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-background hover:bg-background/20"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
          >
            <ChevronLeft className="h-8 w-8" />
            <span className="sr-only">Föregående</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-background hover:bg-background/20"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
          >
            <ChevronRight className="h-8 w-8" />
            <span className="sr-only">Nästa</span>
          </Button>
        </>
      )}

      {/* Zoom controls */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-background hover:bg-background/20"
          onClick={(e) => {
            e.stopPropagation();
            handleZoom(-ZOOM_STEP);
          }}
          disabled={zoom <= MIN_ZOOM}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <span className="text-background text-sm min-w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-background hover:bg-background/20"
          onClick={(e) => {
            e.stopPropagation();
            handleZoom(ZOOM_STEP);
          }}
          disabled={zoom >= MAX_ZOOM}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        {zoom !== 1 && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-background hover:bg-background/20"
            onClick={(e) => {
              e.stopPropagation();
              resetView();
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Image counter */}
      {hasMultiple && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 text-background bg-foreground/50 px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Image container with zoom and pan */}
      <div
        ref={containerRef}
        className={cn(
          'flex items-center justify-center w-full h-full p-4 overflow-hidden',
          zoom > 1 ? 'cursor-grab' : 'cursor-default',
          isDragging && 'cursor-grabbing'
        )}
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={currentImage.src}
          alt={currentImage.alt || 'Image'}
          draggable={false}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            userSelect: 'none',
          }}
        />
      </div>

      {/* Metadata overlay */}
      {currentImage.metadata && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-foreground/70 text-background px-4 py-2 rounded-lg text-sm text-center">
          {currentImage.metadata.filename && (
            <div className="font-medium">{currentImage.metadata.filename}</div>
          )}
          <div className="text-background/70 space-x-2">
            {currentImage.metadata.dimensions && (
              <span>{currentImage.metadata.dimensions}</span>
            )}
            {currentImage.metadata.size && (
              <span>{formatFileSize(currentImage.metadata.size)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
