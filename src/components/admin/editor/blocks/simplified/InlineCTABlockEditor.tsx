'use client';

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
import { LinkInput } from '@/components/admin/editor/LinkInput';
import type { InlineCTABlock } from '@/types/blocks';

interface InlineCTABlockEditorProps {
  block: InlineCTABlock;
  onChange: (data: Partial<InlineCTABlock>) => void;
}

export function InlineCTABlockEditor({
  block,
  onChange,
}: InlineCTABlockEditorProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel htmlFor="text">Knapptext *</FieldLabel>
        <FieldContent>
          <Input
            id="text"
            value={block.text || ''}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Läs mer, Kontakta oss, etc..."
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="link">Länk *</FieldLabel>
        <FieldContent>
          <LinkInput
            value={block.link || ''}
            onChange={(value) => onChange({ link: value })}
          />
        </FieldContent>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="style">Stil</FieldLabel>
          <FieldContent>
            <Select
              value={block.style || 'primary'}
              onValueChange={(value) => onChange({ style: value as InlineCTABlock['style'] })}
            >
              <SelectTrigger id="style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primär</SelectItem>
                <SelectItem value="secondary">Sekundär</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="align">Justering</FieldLabel>
          <FieldContent>
            <Select
              value={block.align || 'left'}
              onValueChange={(value) => onChange({ align: value as InlineCTABlock['align'] })}
            >
              <SelectTrigger id="align">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Vänster</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Höger</SelectItem>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
      </div>
    </div>
  );
}
