'use client';

import { TestimonialsBlock } from '@/types/blocks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TestimonialsBlockEditorProps {
  block: TestimonialsBlock;
  onChange: (data: Partial<TestimonialsBlock>) => void;
}

export function TestimonialsBlockEditor({ block, onChange }: TestimonialsBlockEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Rubrik</Label>
        <Input
          value={block.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Vad våra kunder säger"
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
        <Label>Layout</Label>
        <Select
          value={block.layout}
          onValueChange={(value) => onChange({ layout: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="carousel">Karusell</SelectItem>
            <SelectItem value="grid">Rutnät</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Testimonial IDs (kommaseparerade)</Label>
        <Input
          value={block.testimonialIds.join(', ')}
          onChange={(e) => {
            const ids = e.target.value.split(',').map((id) => id.trim()).filter(Boolean);
            onChange({ testimonialIds: ids });
          }}
          placeholder="id1, id2, id3"
        />
        <p className="text-xs text-muted-foreground">
          Ange testimonial IDs separerade med kommatecken
        </p>
      </div>
    </div>
  );
}
