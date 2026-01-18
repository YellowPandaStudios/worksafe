import { DividerBlock } from '@/types/blocks';
import { cn } from '@/lib/utils';

interface DividerProps {
  block: DividerBlock;
}

export function Divider({ block }: DividerProps) {
  if (block.style === 'none') return null;

  return (
    <div
      className={cn(
        'w-full',
        block.style === 'line' && 'border-t border-border',
        block.style === 'dots' && 'border-t border-dotted border-border'
      )}
    />
  );
}
