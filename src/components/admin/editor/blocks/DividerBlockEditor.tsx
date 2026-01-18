'use client';

import { DividerBlock } from '@/types/blocks';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DividerBlockEditorProps {
  block: DividerBlock;
  onChange: (data: Partial<DividerBlock>) => void;
}

export function DividerBlockEditor({ block, onChange }: DividerBlockEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Stil</Label>
        <Select
          value={block.style}
          onValueChange={(value) => onChange({ style: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Linje</SelectItem>
            <SelectItem value="dots">Punkter</SelectItem>
            <SelectItem value="none">Ingen</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
