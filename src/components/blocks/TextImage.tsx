import Image from 'next/image';
import Link from 'next/link';
import { TextImageBlock } from '@/types/blocks';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TextImageProps {
  block: TextImageBlock;
}

export function TextImage({ block }: TextImageProps) {
  const { title, text, image, imageAlt, imagePosition, ctaText, ctaLink } = block;

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      {imagePosition === 'left' && image && (
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <Image
            src={image}
            alt={imageAlt || ''}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div>
        {title && (
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
        )}
        <div className="prose prose-sm max-w-none mb-6">
          <p className="whitespace-pre-line">{text}</p>
        </div>
        {ctaText && ctaLink && (
          <Button asChild>
            <Link href={ctaLink}>{ctaText}</Link>
          </Button>
        )}
      </div>

      {imagePosition === 'right' && image && (
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <Image
            src={image}
            alt={imageAlt || ''}
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
