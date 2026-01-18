import { cn } from '@/lib/utils';
import type { BaseBlock } from '@/types/blocks';

const BG_CLASSES = {
  white: 'bg-background',
  gray: 'bg-muted',
  primary: 'bg-primary text-primary-foreground',
  dark: 'bg-foreground text-background',
};

const PADDING_TOP_CLASSES = {
  none: 'pt-0',
  sm: 'pt-8',
  md: 'pt-12',
  lg: 'pt-16 md:pt-24',
};

const PADDING_BOTTOM_CLASSES = {
  none: 'pb-0',
  sm: 'pb-8',
  md: 'pb-12',
  lg: 'pb-16 md:pb-24',
};

const MAX_WIDTH_CLASSES = {
  xl: 'max-w-7xl',
  full: 'max-w-none',
};

// Special max-width for Hero blocks (8xl = 88rem = 1408px)
const HERO_MAX_WIDTH_CLASSES = {
  xl: 'max-w-[88rem]',
  full: 'max-w-none',
};

interface BlockWrapperProps {
  block: BaseBlock;
  children: React.ReactNode;
}

export function BlockWrapper({ block, children }: BlockWrapperProps) {
  const {
    background = 'white',
    paddingTop = 'md',
    paddingBottom = 'md',
    maxWidth = 'xl',
    anchor,
  } = block;

  // Use special max-width for Hero blocks, and reduce left padding when maxWidth is "xl"
  const isHero = block.type === 'hero';
  const maxWidthClass = isHero 
    ? HERO_MAX_WIDTH_CLASSES[maxWidth] 
    : MAX_WIDTH_CLASSES[maxWidth];
  const isHeroXl = isHero && maxWidth === 'xl';
  const paddingClass = isHeroXl ? 'pl-2 pr-4' : 'px-4';

  return (
    <section
      id={anchor}
      className={cn(
        BG_CLASSES[background],
        PADDING_TOP_CLASSES[paddingTop],
        PADDING_BOTTOM_CLASSES[paddingBottom]
      )}
    >
      <div className={cn('container mx-auto', paddingClass, maxWidthClass)}>
        {children}
      </div>
    </section>
  );
}
