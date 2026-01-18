'use client';

import { HTMLEmbedBlock } from '@/types/blocks';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface HTMLEmbedBlockEditorProps {
  block: HTMLEmbedBlock;
  onChange: (data: Partial<HTMLEmbedBlock>) => void;
}

export function HTMLEmbedBlockEditor({ block, onChange }: HTMLEmbedBlockEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>HTML-kod</Label>
        <Textarea
          value={block.code}
          onChange={(e) => onChange({ code: e.target.value })}
          placeholder="<div>...</div>"
          rows={10}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Varning: HTML-kod körs direkt. Använd endast kod från betrodda källor.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Label>Sandboxad (begränsad körning)</Label>
        <Switch
          checked={block.sandboxed !== false}
          onCheckedChange={(checked) => onChange({ sandboxed: checked })}
        />
      </div>
    </div>
  );
}
