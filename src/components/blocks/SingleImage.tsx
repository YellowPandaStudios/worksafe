'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { SingleImageBlock } from '@/types/blocks';

interface SingleImageProps {
  block: SingleImageBlock;
}

const SIZE_CLASSES = {
  small: 'max-w-md',
  medium: 'max-w-2xl',
  large: 'max-w-4xl',
  full: 'max-w-full',
};

export function SingleImage({ block }: SingleImageProps): React.ReactElement | null {
  const { url, alt, caption, size = 'large' } = block;

  if (!url) {
    return null;
  }

  return (
    <figure className={cn('mx-auto', SIZE_CLASSES[size])}>
      <div className="relative aspect-video overflow-hidden rounded-lg">
        <Image
          src={url}
          alt={alt || ''}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
