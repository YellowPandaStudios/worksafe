'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  path: string;
  type: string;
  isActive: boolean;
  sortOrder: number;
  children?: Category[];
  _count?: {
    services: number;
  };
}

interface CategoryTreeProps {
  categories: Category[];
  onReorder?: (items: { id: string; sortOrder: number; parentId: string | null }[]) => void;
}

interface CategoryNodeProps {
  category: Category;
  depth: number;
  onDelete: (id: string) => void;
}

function CategoryNode({ category, depth, onDelete }: CategoryNodeProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const serviceCount = category._count?.services || 0;

  const typeLabels: Record<string, string> = {
    main: 'Huvudkategori',
    section: 'Sektion',
    sub_category: 'Underkategori',
    category: 'Kategori',
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          'group flex items-center gap-2 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors',
          !category.isActive && 'opacity-60'
        )}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {/* Drag handle */}
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />

        {/* Expand/collapse button */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Folder icon */}
        {hasChildren && isExpanded ? (
          <FolderOpen className="h-4 w-4 text-primary" />
        ) : (
          <Folder className="h-4 w-4 text-muted-foreground" />
        )}

        {/* Category name and info */}
        <Link
          href={`/admin/categories/${category.id}`}
          className="flex-1 flex items-center gap-2 min-w-0"
        >
          <span className="font-medium truncate">{category.name}</span>
          <Badge variant="outline" className="text-xs shrink-0">
            {typeLabels[category.type] || category.type}
          </Badge>
          {serviceCount > 0 && (
            <span className="text-xs text-muted-foreground shrink-0">
              {serviceCount} tjänst{serviceCount !== 1 ? 'er' : ''}
            </span>
          )}
          {!category.isActive && (
            <Badge variant="secondary" className="text-xs shrink-0">
              <EyeOff className="h-3 w-3 mr-1" />
              Inaktiv
            </Badge>
          )}
        </Link>

        {/* Path preview */}
        <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded hidden lg:block">
          {category.path}
        </code>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/categories/${category.id}`}>
                <Pencil className="h-4 w-4 mr-2" />
                Redigera
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={category.path} target="_blank">
                <Eye className="h-4 w-4 mr-2" />
                Visa på webbplatsen
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/categories/new?parentId=${category.id}`}>
                <Plus className="h-4 w-4 mr-2" />
                Lägg till underkategori
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Ta bort
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {category.children!.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              depth={depth + 1}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill ta bort kategorin "{category.name}"?
              {hasChildren && (
                <span className="block mt-2 text-destructive font-medium">
                  Denna kategori har underkategorier. Du måste ta bort eller flytta dem först.
                </span>
              )}
              {serviceCount > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Denna kategori har {serviceCount} tjänst{serviceCount !== 1 ? 'er' : ''}.
                  Du måste flytta dem till en annan kategori först.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(category.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={hasChildren || serviceCount > 0}
            >
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function CategoryTree({ categories }: CategoryTreeProps): React.ReactElement {
  const router = useRouter();

  const handleDelete = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Kunde inte ta bort kategorin');
      }

      toast.success('Kategorin har tagits bort');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kunde inte ta bort kategorin');
    }
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">Inga kategorier ännu</p>
        <p className="text-sm mt-1">Skapa din första kategori för att komma igång.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4 mr-2" />
            Skapa kategori
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg divide-y">
      {categories.map((category) => (
        <CategoryNode
          key={category.id}
          category={category}
          depth={0}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
