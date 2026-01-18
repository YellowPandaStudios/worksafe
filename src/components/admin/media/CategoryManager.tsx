'use client';

import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FolderOpen,
  X,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface MediaCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  _count?: {
    media: number;
  };
}

interface CategoryManagerProps {
  trigger?: React.ReactNode;
  onCategoriesChange?: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
];

/**
 * Category Manager component for creating, editing, and deleting media categories
 */
export function CategoryManager({
  trigger,
  onCategoriesChange,
}: CategoryManagerProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<MediaCategory | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [color, setColor] = useState<string | null>(null);

  // Fetch categories
  const { data, isLoading } = useSWR<{ data: MediaCategory[] }>(
    open ? '/api/media/categories' : null,
    fetcher
  );
  const categories = data?.data ?? [];

  // Generate slug from name
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .replace(/[åä]/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setName('');
    setSlug('');
    setColor(null);
    setEditingId(null);
    setIsCreating(false);
    setError(null);
  }, []);

  // Start editing
  const startEdit = useCallback((category: MediaCategory) => {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setColor(category.color);
    setIsCreating(false);
    setError(null);
  }, []);

  // Start creating
  const startCreate = useCallback(() => {
    resetForm();
    setIsCreating(true);
  }, [resetForm]);

  // Save (create or update)
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setError('Namn krävs');
      return;
    }

    const finalSlug = slug.trim() || generateSlug(name);
    if (!finalSlug) {
      setError('Slug krävs');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const url = editingId
        ? `/api/media/categories/${editingId}`
        : '/api/media/categories';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: finalSlug,
          color,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Kunde inte spara kategori');
      }

      // Refresh categories
      mutate('/api/media/categories');
      onCategoriesChange?.();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setIsSaving(false);
    }
  }, [name, slug, color, editingId, generateSlug, resetForm, onCategoriesChange]);

  // Delete - shows confirmation dialog
  const handleDeleteClick = useCallback((category: MediaCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  }, []);

  // Actual delete operation
  const handleDeleteConfirm = useCallback(async () => {
    if (!categoryToDelete) return;

    const id = categoryToDelete.id;
    setDeleteDialogOpen(false);

    try {
      const response = await fetch(`/api/media/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Kunde inte ta bort kategori');
      }

      // Refresh categories
      mutate('/api/media/categories');
      onCategoriesChange?.();

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setCategoryToDelete(null);
    }
  }, [categoryToDelete, editingId, resetForm, onCategoriesChange]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="h-9 font-normal">
            <FolderOpen className="mr-2 h-4 w-4" />
            Hantera kategorier
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bildkategorier</DialogTitle>
          <DialogDescription>
            Skapa och hantera kategorier för att organisera ditt bildbibliotek.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category list */}
          <div className="space-y-2">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : categories.length === 0 && !isCreating ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Inga kategorier ännu. Skapa din första!
              </p>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-md border',
                    editingId === category.id && 'border-primary bg-muted/50'
                  )}
                >
                  {/* Color indicator */}
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{
                      backgroundColor: category.color || 'hsl(var(--muted))',
                    }}
                  />

                  {/* Name and count */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {category._count?.media ?? 0} bilder
                    </p>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => startEdit(category)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDeleteClick(category)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Create/Edit form */}
          {(isCreating || editingId) && (
            <div className="space-y-3 p-3 rounded-md border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {editingId ? 'Redigera kategori' : 'Ny kategori'}
                </Label>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={resetForm}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-name" className="text-xs">
                  Namn
                </Label>
                <Input
                  id="category-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingId) {
                      setSlug(generateSlug(e.target.value));
                    }
                  }}
                  placeholder="T.ex. Produktbilder"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-slug" className="text-xs">
                  Slug
                </Label>
                <Input
                  id="category-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="t-ex-produktbilder"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Färg</Label>
                <div className="flex gap-1 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={cn(
                        'w-6 h-6 rounded-full border-2 transition-transform hover:scale-110',
                        color === c ? 'border-foreground scale-110' : 'border-transparent'
                      )}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                  <button
                    type="button"
                    className={cn(
                      'w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 bg-muted',
                      color === null ? 'border-foreground scale-110' : 'border-transparent'
                    )}
                    onClick={() => setColor(null)}
                  >
                    <X className="h-3 w-3 mx-auto text-muted-foreground" />
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                className="w-full"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {editingId ? 'Spara ändringar' : 'Skapa kategori'}
              </Button>
            </div>
          )}

          {/* Add button */}
          {!isCreating && !editingId && (
            <Button
              variant="outline"
              className="w-full"
              onClick={startCreate}
            >
              <Plus className="h-4 w-4 mr-2" />
              Lägg till kategori
            </Button>
          )}
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort kategori</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete && (
                <>
                  Är du säker på att du vill ta bort kategorin &quot;{categoryToDelete.name}&quot;?
                  {(categoryToDelete._count?.media ?? 0) > 0 && (
                    <span className="block mt-2 font-medium text-destructive">
                      {categoryToDelete._count?.media} bild(er) kommer att bli okategoriserade.
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
              Avbryt
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
