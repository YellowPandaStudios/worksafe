'use client';

import { MapBlock } from '@/types/blocks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MapBlockEditorProps {
  block: MapBlock;
  onChange: (data: Partial<MapBlock>) => void;
}

export function MapBlockEditor({ block, onChange }: MapBlockEditorProps) {
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
        <Label>Adress</Label>
        <Input
          value={block.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="Gatunamn 123, 123 45 Stad"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Latitud</Label>
          <Input
            type="number"
            step="any"
            value={block.lat}
            onChange={(e) => onChange({ lat: parseFloat(e.target.value) || 0 })}
            placeholder="59.3293"
          />
        </div>
        <div className="space-y-2">
          <Label>Longitud</Label>
          <Input
            type="number"
            step="any"
            value={block.lng}
            onChange={(e) => onChange({ lng: parseFloat(e.target.value) || 0 })}
            placeholder="18.0686"
          />
        </div>
        <div className="space-y-2">
          <Label>Zoom</Label>
          <Input
            type="number"
            min="1"
            max="20"
            value={block.zoom}
            onChange={(e) => onChange({ zoom: parseInt(e.target.value) || 14 })}
            placeholder="14"
          />
        </div>
      </div>
    </div>
  );
}
