'use client';

import { ImagePicker } from '@/components/admin/media/ImagePicker';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldContent,
  FieldLabel,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SingleImageBlock } from '@/types/blocks';

interface SingleImageBlockEditorProps {
  block: SingleImageBlock;
  onChange: (data: Partial<SingleImageBlock>) => void;
}

export function SingleImageBlockEditor({
  block,
  onChange,
}: SingleImageBlockEditorProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel>Bild</FieldLabel>
        <FieldContent>
          <ImagePicker
            value={block.url || null}
            onChange={(url) => onChange({ url: url || '' })}
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="alt">Alt-text</FieldLabel>
        <FieldContent>
          <Input
            id="alt"
            value={block.alt || ''}
            onChange={(e) => onChange({ alt: e.target.value })}
            placeholder="Beskriv bilden för tillgänglighet..."
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="caption">Bildtext (valfritt)</FieldLabel>
        <FieldContent>
          <Input
            id="caption"
            value={block.caption || ''}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Bildtext som visas under bilden..."
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="size">Storlek</FieldLabel>
        <FieldContent>
          <Select
            value={block.size || 'large'}
            onValueChange={(value) => onChange({ size: value as SingleImageBlock['size'] })}
          >
            <SelectTrigger id="size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Liten</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Stor</SelectItem>
              <SelectItem value="full">Fullbredd</SelectItem>
            </SelectContent>
          </Select>
        </FieldContent>
      </Field>
    </div>
  );
}
