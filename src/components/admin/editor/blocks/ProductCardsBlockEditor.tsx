'use client';

import { useState, useEffect } from 'react';
import { ProductCardsBlock } from '@/types/blocks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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

interface ProductCardsBlockEditorProps {
  block: ProductCardsBlock;
  onChange: (data: Partial<ProductCardsBlock>) => void;
}

export function ProductCardsBlockEditor({ block, onChange }: ProductCardsBlockEditorProps) {
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
          placeholder="Våra produkter"
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

      <div className="flex items-center justify-between">
        <Label>Visa pris</Label>
        <Switch
          checked={block.showPrice || false}
          onCheckedChange={(checked) => onChange({ showPrice: checked })}
        />
      </div>

      <div className="space-y-2">
        <Label>Produkt IDs (kommaseparerade, valfritt)</Label>
        <Input
          value={block.productIds?.join(', ') || ''}
          onChange={(e) => {
            const ids = e.target.value.split(',').map((id) => id.trim()).filter(Boolean);
            onChange({ productIds: ids.length > 0 ? ids : undefined });
          }}
          placeholder="id1, id2, id3"
        />
        <p className="text-xs text-muted-foreground">
          Lämna tomt för att visa alla produkter. Ange specifika IDs för att visa endast dessa.
        </p>
      </div>
    </div>
  );
}
