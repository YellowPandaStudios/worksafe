import { SpacerBlock } from '@/types/blocks';

interface SpacerProps {
  block: SpacerBlock;
}

const HEIGHT_CLASSES = {
  sm: 'h-8',
  md: 'h-16',
  lg: 'h-24',
  xl: 'h-32',
};

export function Spacer({ block }: SpacerProps) {
  return <div className={HEIGHT_CLASSES[block.height]} />;
}
