'use client';

import { StatsBlock } from '@/types/blocks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface StatsBlockEditorProps {
  block: StatsBlock;
  onChange: (data: Partial<StatsBlock>) => void;
}

export function StatsBlockEditor({ block, onChange }: StatsBlockEditorProps) {
  const updateStat = (index: number, data: Partial<StatsBlock['stats'][0]>) => {
    const stats = [...block.stats];
    stats[index] = { ...stats[index], ...data };
    onChange({ stats });
  };

  const addStat = () => {
    onChange({
      stats: [...block.stats, { number: '0', suffix: '', label: '' }],
    });
  };

  const removeStat = (index: number) => {
    onChange({
      stats: block.stats.filter((_, i) => i !== index),
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
          <Label>Statistik</Label>
          <Button type="button" variant="outline" size="sm" onClick={addStat}>
            <Plus className="h-4 w-4 mr-1" />
            Lägg till
          </Button>
        </div>

        {block.stats.map((stat, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Statistik {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeStat(index)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs">Nummer</Label>
                <Input
                  value={stat.number}
                  onChange={(e) => updateStat(index, { number: e.target.value })}
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Suffix</Label>
                <Input
                  value={stat.suffix || ''}
                  onChange={(e) => updateStat(index, { suffix: e.target.value })}
                  placeholder="+"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Etikett</Label>
              <Input
                value={stat.label}
                onChange={(e) => updateStat(index, { label: e.target.value })}
                placeholder="Nöjda kunder"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
