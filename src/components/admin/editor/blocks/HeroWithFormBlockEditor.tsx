'use client';

import { HeroWithFormBlock } from '@/types/blocks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImagePicker } from '../../media/ImagePicker';

interface HeroWithFormBlockEditorProps {
  block: HeroWithFormBlock;
  onChange: (data: Partial<HeroWithFormBlock>) => void;
}

export function HeroWithFormBlockEditor({ block, onChange }: HeroWithFormBlockEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Rubrik</Label>
        <Input
          value={block.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Huvudrubrik"
        />
      </div>

      <div className="space-y-2">
        <Label>Underrubrik</Label>
        <Input
          value={block.subtitle || ''}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="Valfri underrubrik"
        />
      </div>

      <div className="space-y-2">
        <Label>Bakgrundsbild</Label>
        <ImagePicker
          value={block.image}
          onChange={(url) => onChange({ image: url || undefined })}
        />
        {block.image && (
          <Input
            value={block.imageAlt || ''}
            onChange={(e) => onChange({ imageAlt: e.target.value })}
            placeholder="Alt-text för bilden"
            className="mt-2"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>Formulär ID (HubSpot)</Label>
        <Input
          value={block.formId || ''}
          onChange={(e) => onChange({ formId: e.target.value })}
          placeholder="hubspot-form-id"
        />
      </div>

      <div className="space-y-2">
        <Label>Formulär rubrik</Label>
        <Input
          value={block.formTitle || ''}
          onChange={(e) => onChange({ formTitle: e.target.value })}
          placeholder="Kontakta oss"
        />
      </div>
    </div>
  );
}
