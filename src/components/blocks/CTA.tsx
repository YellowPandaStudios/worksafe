import Link from 'next/link';
import { CTABlock } from '@/types/blocks';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CTAProps {
  block: CTABlock;
}

const STYLE_CLASSES = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border bg-background hover:bg-accent',
};

export function CTA({ block }: CTAProps) {
  const { title, subtitle, ctaText, ctaLink, style } = block;

  return (
    <div className="block-header-centered">
      <h2 className="block-title">{title}</h2>
      {subtitle && (
        <p className="block-subtitle">{subtitle}</p>
      )}
      {ctaText && ctaLink && (
        <div className="mt-6">
          <Button asChild size="lg" variant={style === 'outline' ? 'outline' : style === 'secondary' ? 'secondary' : 'default'}>
            <Link href={ctaLink}>{ctaText}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
