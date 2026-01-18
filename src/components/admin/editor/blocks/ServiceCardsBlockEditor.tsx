'use client';

import { useState, useEffect } from 'react';
import { ServiceCardsBlock } from '@/types/blocks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FlatCategory {
  id: string;
  name: string;
  depth: number;
}

interface ServiceCardsBlockEditorProps {
  block: ServiceCardsBlock;
  onChange: (data: Partial<ServiceCardsBlock>) => void;
}

export function ServiceCardsBlockEditor({ block, onChange }: ServiceCardsBlockEditorProps) {
  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories(): Promise<void> {
      try {
        const response = await fetch('/api/admin/categories?format=flat');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Rubrik</Label>
        <Input
          value={block.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Våra tjänster"
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
        <Label>Kolumner</Label>
        <Select
          value={block.columns.toString()}
          onValueChange={(value) => onChange({ columns: parseInt(value) as 2 | 3 | 4 })}
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

      <div className="space-y-2">
        <Label>Kategorifilter (valfritt)</Label>
        <Select
          value={block.categoryId || 'all'}
          onValueChange={(value) => onChange({ categoryId: value === 'all' ? undefined : value })}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Alla kategorier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla kategorier</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {'—'.repeat(cat.depth)} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Service IDs (kommaseparerade, valfritt)</Label>
        <Input
          value={block.serviceIds?.join(', ') || ''}
          onChange={(e) => {
            const ids = e.target.value.split(',').map((id) => id.trim()).filter(Boolean);
            onChange({ serviceIds: ids.length > 0 ? ids : undefined });
          }}
          placeholder="id1, id2, id3"
        />
        <p className="text-xs text-muted-foreground">
          Lämna tomt för att visa alla tjänster. Ange specifika IDs för att visa endast dessa.
        </p>
      </div>
    </div>
  );
}
