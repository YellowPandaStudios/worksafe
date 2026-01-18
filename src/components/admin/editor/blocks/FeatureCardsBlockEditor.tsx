'use client';

import { FeatureCardsBlock } from '@/types/blocks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { LinkInput } from '../LinkInput';
import { RichTextEditor } from '../RichTextEditor';
import { JSONContent } from '@tiptap/react';

interface FeatureCardsBlockEditorProps {
  block: FeatureCardsBlock;
  onChange: (data: Partial<FeatureCardsBlock>) => void;
}

export function FeatureCardsBlockEditor({ block, onChange }: FeatureCardsBlockEditorProps) {
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

  const updateCard = (index: number, data: Partial<FeatureCardsBlock['cards'][0]>) => {
    const cards = [...block.cards];
    cards[index] = { ...cards[index], ...data };
    onChange({ cards });
  };

  const addCard = () => {
    onChange({
      cards: [...block.cards, { icon: 'ArrowRight', title: '', description: { type: 'doc', content: [] }, link: '' }],
    });
  };

  const removeCard = (index: number) => {
    onChange({
      cards: block.cards.filter((_, i) => i !== index),
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

      <div className="space-y-2">
        <Label>Underrubrik</Label>
        <Input
          value={block.subtitle || ''}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="Valfri underrubrik"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Kort</Label>
          <Button type="button" variant="outline" size="sm" onClick={addCard}>
            <Plus className="h-4 w-4 mr-1" />
            Lägg till
          </Button>
        </div>

        {block.cards.map((card, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Kort {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCard(index)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Ikon (Lucide)</Label>
              <Input
                value={card.icon}
                onChange={(e) => updateCard(index, { icon: e.target.value })}
                placeholder="ArrowRight"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Titel</Label>
              <Input
                value={card.title}
                onChange={(e) => updateCard(index, { title: e.target.value })}
                placeholder="Korttitel"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Beskrivning</Label>
              <RichTextEditor
                content={getDescriptionContent(card.description)}
                onChange={(content) => updateCard(index, { description: content })}
                placeholder="Beskrivning"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Länk</Label>
              <LinkInput
                value={card.link || ''}
                onChange={(value) => updateCard(index, { link: value })}
                placeholder="/tjanster"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
