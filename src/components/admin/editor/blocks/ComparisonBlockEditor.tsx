'use client';

import { ComparisonBlock } from '@/types/blocks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface ComparisonBlockEditorProps {
  block: ComparisonBlock;
  onChange: (data: Partial<ComparisonBlock>) => void;
}

export function ComparisonBlockEditor({ block, onChange }: ComparisonBlockEditorProps) {
  const updateItem = (index: number, data: Partial<ComparisonBlock['items'][0]>) => {
    const items = [...block.items];
    items[index] = { ...items[index], ...data };
    onChange({ items });
  };

  const addItem = () => {
    onChange({
      items: [...block.items, { name: '', features: [], price: '', highlighted: false }],
    });
  };

  const removeItem = (index: number) => {
    onChange({
      items: block.items.filter((_, i) => i !== index),
    });
  };

  const updateFeature = (itemIndex: number, featureIndex: number, value: string) => {
    const items = [...block.items];
    const features = [...items[itemIndex].features];
    features[featureIndex] = value;
    items[itemIndex] = { ...items[itemIndex], features };
    onChange({ items });
  };

  const addFeature = (itemIndex: number) => {
    const items = [...block.items];
    items[itemIndex] = {
      ...items[itemIndex],
      features: [...items[itemIndex].features, ''],
    };
    onChange({ items });
  };

  const removeFeature = (itemIndex: number, featureIndex: number) => {
    const items = [...block.items];
    items[itemIndex] = {
      ...items[itemIndex],
      features: items[itemIndex].features.filter((_, i) => i !== featureIndex),
    };
    onChange({ items });
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
          <Label>Jämförelseobjekt</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Lägg till
          </Button>
        </div>

        {block.items.map((item, itemIndex) => (
          <div key={itemIndex} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Objekt {itemIndex + 1}</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Framhävd</Label>
                  <Switch
                    checked={item.highlighted || false}
                    onCheckedChange={(checked) => updateItem(itemIndex, { highlighted: checked })}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(itemIndex)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Namn</Label>
              <Input
                value={item.name}
                onChange={(e) => updateItem(itemIndex, { name: e.target.value })}
                placeholder="Produktnamn"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Pris (valfritt)</Label>
              <Input
                value={item.price || ''}
                onChange={(e) => updateItem(itemIndex, { price: e.target.value })}
                placeholder="999 kr"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Funktioner</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addFeature(itemIndex)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Lägg till
                </Button>
              </div>
              {item.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(itemIndex, featureIndex, e.target.value)}
                    placeholder="Funktion"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(itemIndex, featureIndex)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs">CTA-text (valfritt)</Label>
                <Input
                  value={item.ctaText || ''}
                  onChange={(e) => updateItem(itemIndex, { ctaText: e.target.value })}
                  placeholder="Köp nu"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">CTA-länk (valfritt)</Label>
                <Input
                  value={item.ctaLink || ''}
                  onChange={(e) => updateItem(itemIndex, { ctaLink: e.target.value })}
                  placeholder="/produkt"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
