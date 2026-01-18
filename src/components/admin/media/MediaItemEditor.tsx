'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MediaCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

interface ImageVariants {
  thumb?: string;
  small?: string;
  medium?: string;
  large?: string;
}

interface MediaItem {
  id: string;
  url: string;
  cdnUrl: string | null;
  filename: string;
  originalName: string | null;
  alt: string | null;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  folder: string;
  categoryId: string | null;
  category: MediaCategory | null;
  variants: ImageVariants | null;
}

interface MediaItemEditorProps {
  item: MediaItem | null;
  categories: MediaCategory[];
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

/**
 * Dialog for editing a single media item's metadata
 */
export function MediaItemEditor({
  item,
  categories,
  open,
  onClose,
  onSave,
}: MediaItemEditorProps): React.ReactElement | null {
  const [alt, setAlt] = useState(item?.alt || '');
  const [categoryId, setCategoryId] = useState(item?.categoryId || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when item changes
  useState(() => {
    if (item) {
      setAlt(item.alt || '');
      setCategoryId(item.categoryId || '');
    }
  });

  const handleSave = useCallback(async () => {
    if (!item) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/media/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alt: alt || null,
          categoryId: categoryId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Kunde inte spara ändringar');
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setIsSaving(false);
    }
  }, [item, alt, categoryId, onSave, onClose]);

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Redigera bild</DialogTitle>
          <DialogDescription>
            Uppdatera metadata och kategori för denna bild.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Preview */}
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
            {item.mimeType.startsWith('image/') && (
              <Image
                src={item.variants?.medium || item.url}
                alt={item.alt || item.filename}
                fill
                className="object-contain"
              />
            )}
          </div>

          {/* File info */}
          <div className="text-sm text-muted-foreground">
            <p><strong>Filnamn:</strong> {item.originalName || item.filename}</p>
            {item.width && item.height && (
              <p><strong>Storlek:</strong> {item.width} × {item.height} px</p>
            )}
          </div>

          {/* Alt text */}
          <div className="space-y-2">
            <Label htmlFor="alt-text">Alt-text (för tillgänglighet och SEO)</Label>
            <Textarea
              id="alt-text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Beskriv bilden..."
              rows={2}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={categoryId || 'none'}
              onValueChange={(value) => setCategoryId(value === 'none' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Välj kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ingen kategori</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      {cat.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      )}
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Spara
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
