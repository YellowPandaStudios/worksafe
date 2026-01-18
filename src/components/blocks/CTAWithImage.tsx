import Image from 'next/image';
import Link from 'next/link';
import { CTAWithImageBlock } from '@/types/blocks';
import { Button } from '@/components/ui/button';

interface CTAWithImageProps {
  block: CTAWithImageBlock;
}

export function CTAWithImage({ block }: CTAWithImageProps) {
  const { title, subtitle, image, imageAlt, imagePosition, ctaText, ctaLink } = block;

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
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        {subtitle && (
          <p className="text-lg text-muted-foreground mb-6">{subtitle}</p>
        )}
        {ctaText && ctaLink && (
          <Button asChild size="lg">
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
