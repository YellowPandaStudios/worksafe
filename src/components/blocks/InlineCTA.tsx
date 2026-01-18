'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { InlineCTABlock } from '@/types/blocks';

interface InlineCTAProps {
  block: InlineCTABlock;
}

const ALIGN_CLASSES = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export function InlineCTA({ block }: InlineCTAProps): React.ReactElement | null {
  const { text, link, style = 'primary', align = 'left' } = block;

  if (!text || !link) {
    return null;
  }

  const variant = style === 'primary' ? 'default' : style;

  return (
    <div className={cn('flex', ALIGN_CLASSES[align])}>
      <Button variant={variant} asChild>
        <Link href={link}>{text}</Link>
      </Button>
    </div>
  );
}
