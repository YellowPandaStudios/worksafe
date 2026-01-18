'use client';

import { LogoGridBlock } from '@/types/blocks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ImagePicker } from '../../media/ImagePicker';
import { Plus, Trash2 } from 'lucide-react';

interface LogoGridBlockEditorProps {
  block: LogoGridBlock;
  onChange: (data: Partial<LogoGridBlock>) => void;
}

export function LogoGridBlockEditor({ block, onChange }: LogoGridBlockEditorProps) {
  const updateLogo = (index: number, data: Partial<LogoGridBlock['logos'][0]>) => {
    const logos = [...block.logos];
    logos[index] = { ...logos[index], ...data };
    onChange({ logos });
  };

  const addLogo = () => {
    onChange({
      logos: [...block.logos, { image: '', alt: '', link: '' }],
    });
  };

  const removeLogo = (index: number) => {
    onChange({
      logos: block.logos.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Rubrik</Label>
        <Input
          value={block.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Våra kunder"
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

      <div className="flex items-center justify-between">
        <Label>Gråskala</Label>
        <Switch
          checked={block.grayscale || false}
          onCheckedChange={(checked) => onChange({ grayscale: checked })}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Logotyper</Label>
          <Button type="button" variant="outline" size="sm" onClick={addLogo}>
            <Plus className="h-4 w-4 mr-1" />
            Lägg till
          </Button>
        </div>

        {block.logos.map((logo, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Logo {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeLogo(index)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Bild</Label>
              <ImagePicker
                value={logo.image}
                onChange={(url) => updateLogo(index, { image: url || '' })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Alt-text</Label>
              <Input
                value={logo.alt}
                onChange={(e) => updateLogo(index, { alt: e.target.value })}
                placeholder="Företagsnamn"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Länk (valfritt)</Label>
              <Input
                value={logo.link || ''}
                onChange={(e) => updateLogo(index, { link: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
