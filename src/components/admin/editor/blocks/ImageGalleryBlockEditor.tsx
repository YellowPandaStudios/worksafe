'use client';

import { ImageGalleryBlock } from '@/types/blocks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ImagePicker } from '../../media/ImagePicker';
import { Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ImageGalleryBlockEditorProps {
  block: ImageGalleryBlock;
  onChange: (data: Partial<ImageGalleryBlock>) => void;
}

export function ImageGalleryBlockEditor({ block, onChange }: ImageGalleryBlockEditorProps) {
  const updateImage = (index: number, data: Partial<ImageGalleryBlock['images'][0]>) => {
    const images = [...block.images];
    images[index] = { ...images[index], ...data };
    onChange({ images });
  };

  const addImage = () => {
    onChange({
      images: [...block.images, { url: '', alt: '', caption: '' }],
    });
  };

  const removeImage = (index: number) => {
    onChange({
      images: block.images.filter((_, i) => i !== index),
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
        <Label>Kolumner</Label>
        <Select
          value={block.columns.toString()}
          onValueChange={(value) => onChange({ columns: parseInt(value) as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label>Lightbox</Label>
        <Switch
          checked={block.lightbox !== false}
          onCheckedChange={(checked) => onChange({ lightbox: checked })}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Bilder</Label>
          <Button type="button" variant="outline" size="sm" onClick={addImage}>
            <Plus className="h-4 w-4 mr-1" />
            Lägg till
          </Button>
        </div>

        {block.images.map((image, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Bild {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeImage(index)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Bild</Label>
              <ImagePicker
                value={image.url}
                onChange={(url) => updateImage(index, { url: url || '' })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Alt-text</Label>
              <Input
                value={image.alt}
                onChange={(e) => updateImage(index, { alt: e.target.value })}
                placeholder="Beskrivning av bilden"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Bildtext (valfritt)</Label>
              <Input
                value={image.caption || ''}
                onChange={(e) => updateImage(index, { caption: e.target.value })}
                placeholder="Bildtext"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
