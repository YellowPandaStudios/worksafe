'use client';

import { ImagePicker } from '@/components/admin/media/ImagePicker';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Field,
  FieldContent,
  FieldLabel,
} from '@/components/ui/field';
import type { QuoteBlock } from '@/types/blocks';

interface QuoteBlockEditorProps {
  block: QuoteBlock;
  onChange: (data: Partial<QuoteBlock>) => void;
}

export function QuoteBlockEditor({
  block,
  onChange,
}: QuoteBlockEditorProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel htmlFor="text">Citat *</FieldLabel>
        <FieldContent>
          <Textarea
            id="text"
            value={block.text || ''}
            onChange={(e) => onChange({ text: e.target.value })}
            rows={4}
            placeholder="Skriv citatet här..."
          />
        </FieldContent>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="author">Författare</FieldLabel>
          <FieldContent>
            <Input
              id="author"
              value={block.author || ''}
              onChange={(e) => onChange({ author: e.target.value })}
              placeholder="Namn..."
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="role">Roll/Titel</FieldLabel>
          <FieldContent>
            <Input
              id="role"
              value={block.role || ''}
              onChange={(e) => onChange({ role: e.target.value })}
              placeholder="VD, Marknadschef, etc..."
            />
          </FieldContent>
        </Field>
      </div>

      <Field>
        <FieldLabel>Bild (valfritt)</FieldLabel>
        <FieldContent>
          <ImagePicker
            value={block.image || null}
            onChange={(url) => onChange({ image: url || undefined })}
          />
        </FieldContent>
      </Field>
    </div>
  );
}
