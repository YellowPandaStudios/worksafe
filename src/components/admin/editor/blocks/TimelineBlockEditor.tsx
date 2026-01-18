'use client';

import { TimelineBlock } from '@/types/blocks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { RichTextEditor } from '../RichTextEditor';
import { JSONContent } from '@tiptap/react';

interface TimelineBlockEditorProps {
  block: TimelineBlock;
  onChange: (data: Partial<TimelineBlock>) => void;
}

export function TimelineBlockEditor({ block, onChange }: TimelineBlockEditorProps) {
  // Convert string description to JSONContent for backwards compatibility
  const getDescriptionContent = (desc: string | JSONContent | undefined): JSONContent => {
    if (!desc) {
      return { type: 'doc', content: [] };
    }
    // If it's already JSONContent, return it
    if (typeof desc === 'object' && desc !== null) {
      return desc as JSONContent;
    }
    // If it's a string (old format), convert to JSONContent
    if (typeof desc === 'string') {
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: desc }],
          },
        ],
      };
    }
    return { type: 'doc', content: [] };
  };

  const updateItem = (index: number, data: Partial<TimelineBlock['items'][0]>) => {
    const items = [...block.items];
    items[index] = { ...items[index], ...data };
    onChange({ items });
  };

  const addItem = () => {
    onChange({
      items: [...block.items, { date: '', title: '', description: { type: 'doc', content: [] } }],
    });
  };

  const removeItem = (index: number) => {
    onChange({
      items: block.items.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Rubrik</Label>
        <Input
          value={block.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Valfri rubrik"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Tidslinjepunkter</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Lägg till
          </Button>
        </div>

        {block.items.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Punkt {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Datum</Label>
              <Input
                value={item.date}
                onChange={(e) => updateItem(index, { date: e.target.value })}
                placeholder="2024"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Titel</Label>
              <Input
                value={item.title}
                onChange={(e) => updateItem(index, { title: e.target.value })}
                placeholder="Händelse"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Beskrivning</Label>
              <RichTextEditor
                content={getDescriptionContent(item.description)}
                onChange={(content) => updateItem(index, { description: content })}
                placeholder="Beskrivning..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
