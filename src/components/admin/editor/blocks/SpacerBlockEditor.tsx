'use client';

import { SpacerBlock } from '@/types/blocks';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SpacerBlockEditorProps {
  block: SpacerBlock;
  onChange: (data: Partial<SpacerBlock>) => void;
}

export function SpacerBlockEditor({ block, onChange }: SpacerBlockEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Höjd</Label>
        <Select
          value={block.height}
          onValueChange={(value) => onChange({ height: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Liten</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Stor</SelectItem>
            <SelectItem value="xl">Extra stor</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
