'use client';

import { RichTextBlock } from '@/types/blocks';
import { RichTextEditor } from '../RichTextEditor';

interface RichTextBlockEditorProps {
  block: RichTextBlock;
  onChange: (data: Partial<RichTextBlock>) => void;
}

export function RichTextBlockEditor({ block, onChange }: RichTextBlockEditorProps) {
  return (
    <div className="space-y-4">
      <RichTextEditor
        content={block.content}
        onChange={(content) => onChange({ content })}
        placeholder="Börja skriva..."
      />
    </div>
  );
}
