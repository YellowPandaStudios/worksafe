'use client';

import { TestimonialSingleBlock } from '@/types/blocks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TestimonialSingleBlockEditorProps {
  block: TestimonialSingleBlock;
  onChange: (data: Partial<TestimonialSingleBlock>) => void;
}

export function TestimonialSingleBlockEditor({ block, onChange }: TestimonialSingleBlockEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Testimonial ID</Label>
        <Input
          value={block.testimonialId}
          onChange={(e) => onChange({ testimonialId: e.target.value })}
          placeholder="testimonial-id"
        />
      </div>

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
            <SelectItem value="card">Kort</SelectItem>
            <SelectItem value="quote">Citat</SelectItem>
            <SelectItem value="featured">Framhävd</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
