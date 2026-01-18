'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageGalleryBlock } from '@/types/blocks';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  block: ImageGalleryBlock;
}

const COLUMN_CLASSES = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

export function ImageGallery({ block }: ImageGalleryProps) {
  const { title, images, columns, lightbox } = block;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleImageClick = (index: number) => {
    if (lightbox) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  return (
    <div>
      {title && (
        <h2 className="text-3xl font-bold mb-8">{title}</h2>
      )}
      <div className={cn('grid gap-4', COLUMN_CLASSES[columns])}>
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              'relative aspect-video rounded-lg overflow-hidden',
              lightbox && 'cursor-pointer hover:opacity-90 transition-opacity'
            )}
            onClick={() => handleImageClick(index)}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover"
            />
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-foreground/70 text-background p-2 text-sm">
                {image.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {lightbox && lightboxOpen && (
        <ImageLightbox
          images={images.map((img) => ({ src: img.url, alt: img.alt }))}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
