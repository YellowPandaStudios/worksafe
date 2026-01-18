'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import useSWR, { mutate } from 'swr';
import {
  Upload,
  Search,
  Trash2,
  Check,
  X,
  ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Tag,
  Filter,
  Pencil,
  FolderInput,
} from 'lucide-react';
import type { Media } from '@prisma/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MAX_FILE_SIZE } from '@/lib/r2';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { ImageLightbox, type LightboxImage } from '@/components/ui/image-lightbox';
import { CategoryManager } from './CategoryManager';
import { MediaItemEditor } from './MediaItemEditor';

interface ImageVariants {
  thumb?: string;
  small?: string;
  medium?: string;
  large?: string;
}

interface MediaCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
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
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
  } | null;
}

interface MediaResponse {
  data: MediaItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface MediaLibraryProps {
  /** Callback when media is selected (single select mode) */
  onSelect?: (media: MediaItem) => void;
  /** Enable single selection mode */
  selectable?: boolean;
  /** Currently selected media URL (for highlighting) */
  selectedUrl?: string;
  /** Folder to filter/upload to */
  folder?: string;
  /** Number of items per page */
  pageSize?: number;
  /** Custom class name */
  className?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Media Library component for browsing, uploading, and managing media files
 */
export function MediaLibrary({
  onSelect,
  selectable = false,
  selectedUrl,
  folder,
  pageSize = 24,
  className,
}: MediaLibraryProps): React.ReactElement {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [uploadCategoryId, setUploadCategoryId] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // Debounce search
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  // Fetch categories
  const { data: categoriesData, mutate: mutateCategories } = useSWR<{ data: MediaCategory[] }>(
    '/api/media/categories',
    fetcher
  );
  const categories = categoriesData?.data ?? [];

  // Refresh categories (called from CategoryManager)
  const handleCategoriesChange = useCallback(() => {
    mutateCategories();
  }, [mutateCategories]);

  // Build API URL
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (folder) params.set('folder', folder);
    if (selectedCategoryId) params.set('categoryId', selectedCategoryId);
    return `/api/media?${params.toString()}`;
  }, [page, pageSize, debouncedSearch, folder, selectedCategoryId]);

  // Fetch media
  const { data, error, isLoading } = useSWR<MediaResponse>(apiUrl, fetcher, {
    keepPreviousData: true,
  });

  // Upload hook
  const { upload, isUploading } = useMediaUpload({
    onSuccess: (media) => {
      // Refresh the list after successful upload
      mutate(apiUrl);
      toast.success('Bild uppladdad', {
        description: media.originalName || media.filename,
      });
    },
    onError: (error) => {
      toast.error('Uppladdning misslyckades', {
        description: error,
      });
    },
    categoryId: uploadCategoryId || undefined,
  });

  // Dropzone
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        await upload(file, folder || 'uploads');
      }
    },
    [upload, folder]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg'],
    },
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading,
  });

  // Selection handlers
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Delete handler - shows confirmation dialog
  const handleDeleteClick = useCallback(() => {
    if (selectedIds.size === 0) return;
    setDeleteDialogOpen(true);
  }, [selectedIds.size]);

  // Actual delete operation
  const handleDeleteConfirm = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    setIsDeleting(true);
    setDeleteDialogOpen(false);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/media/${id}`, { method: 'DELETE' })
        )
      );
      setSelectedIds(new Set());
      mutate(apiUrl);
      toast.success(`${count} ${count === 1 ? 'bild borttagen' : 'bilder borttagna'}`);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Kunde inte ta bort bilder');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedIds, apiUrl]);

  // Bulk assign category handler
  const handleBulkAssignCategory = useCallback(async (categoryId: string | null) => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    setIsAssigning(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/media/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categoryId }),
          })
        )
      );
      setSelectedIds(new Set());
      mutate(apiUrl);
      toast.success(`${count} ${count === 1 ? 'bild flyttad' : 'bilder flyttade'}`);
    } catch (err) {
      console.error('Assign category error:', err);
      toast.error('Kunde inte flytta bilder');
    } finally {
      setIsAssigning(false);
    }
  }, [selectedIds, apiUrl]);

  // Item click handler
  const handleItemClick = useCallback(
    (item: MediaItem, event: React.MouseEvent, index: number) => {
      if (selectable && onSelect) {
        onSelect(item);
      } else if (event.ctrlKey || event.metaKey) {
        toggleSelection(item.id);
      } else if (item.mimeType.startsWith('image/')) {
        // Calculate lightbox images and find index
        const currentMedia = data?.data ?? [];
        const currentLightboxImages = currentMedia.filter((img) => img.mimeType.startsWith('image/'));
        const lightboxImageIndex = currentLightboxImages.findIndex((img) => img.id === item.id);
        if (lightboxImageIndex !== -1) {
          setLightboxIndex(lightboxImageIndex);
          setLightboxOpen(true);
        }
      }
    },
    [selectable, onSelect, toggleSelection, data]
  );

  const media = data?.data ?? [];
  const pagination = data?.pagination;

  // Prepare lightbox images (only images)
  const lightboxImages = useMemo(() => {
    return media.filter((item) => item.mimeType.startsWith('image/'));
  }, [media]);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        {/* Search and Filters - Top Row */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Sök efter filnamn eller alt-text..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Select
              value={selectedCategoryId || 'all'}
              onValueChange={(value) => {
                setSelectedCategoryId(value === 'all' ? '' : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Alla kategorier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla kategorier</SelectItem>
                <SelectItem value="none">Okategoriserade</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CategoryManager onCategoriesChange={handleCategoriesChange} />
          </div>
        </div>

        {/* Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} markerade
            </span>

            {/* Bulk assign category */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isAssigning}>
                  {isAssigning ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <FolderInput className="h-4 w-4 mr-2" />
                  )}
                  Flytta till...
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAssignCategory(null)}>
                  Ingen kategori
                </DropdownMenuItem>
                {categories.length > 0 && <DropdownMenuSeparator />}
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    onClick={() => handleBulkAssignCategory(cat.id)}
                  >
                    <div className="flex items-center gap-2">
                      {cat.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      )}
                      {cat.name}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
              Avmarkera
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Ta bort
            </Button>
          </div>
        )}
      </div>

      {/* Upload zone */}
      <div className="flex flex-col gap-3">
        {/* Category selector - Above drop zone */}
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">Kategori för uppladdning:</span>
          <Select
            value={uploadCategoryId || 'none'}
            onValueChange={(value) => setUploadCategoryId(value === 'none' ? '' : value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ingen kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ingen kategori</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={cn(
            'relative rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload className="h-10 w-10 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-sm font-medium">Släpp filerna här...</p>
            ) : (
              <>
                <p className="text-sm font-medium">
                  Dra och släpp bilder här, eller klicka för att välja
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF, WebP, SVG (max 10MB)
                </p>
              </>
            )}
          </div>

          {/* Upload spinner */}
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">
                Laddar upp...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && !data && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: pageSize }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">
            Kunde inte ladda media. Försök igen senare.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && media.length === 0 && (
        <div className="rounded-md border border-dashed p-12 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Inga bilder</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {debouncedSearch
              ? 'Inga bilder matchar din sökning.'
              : 'Ladda upp din första bild genom att dra och släppa eller klicka ovan.'}
          </p>
        </div>
      )}

      {/* Media grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {media.map((item, index) => {
            const isSelected = selectedIds.has(item.id);
            const isCurrentSelection = selectedUrl === item.url;

            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => handleItemClick(item, e, index)}
                className={cn(
                  'group relative aspect-square rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  isSelected || isCurrentSelection
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent hover:border-primary/50'
                )}
              >
                {/* Thumbnail */}
                {item.mimeType.startsWith('image/') ? (
                  <Image
                    src={item.variants?.thumb || item.cdnUrl || item.url}
                    alt={item.alt || item.filename}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                {/* Selection checkbox */}
                {!selectable && (
                  <div
                    className={cn(
                      'absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded border transition-opacity',
                      isSelected
                        ? 'bg-primary border-primary text-primary-foreground opacity-100'
                        : 'bg-background/80 border-muted-foreground/50 opacity-0 group-hover:opacity-100'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelection(item.id);
                    }}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                )}

                {/* Current selection indicator */}
                {isCurrentSelection && (
                  <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground z-20">
                    <Check className="h-3 w-3" />
                  </div>
                )}

                {/* Category badge */}
                {item.category && !isCurrentSelection && (
                  <div className="absolute top-2 right-2 z-10">
                    {item.category.color ? (
                      <Badge
                        variant="secondary"
                        className="text-xs text-background"
                        style={{
                          backgroundColor: item.category.color,
                        }}
                      >
                        {item.category.name}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {item.category.name}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Edit button */}
                {!selectable && (
                  <button
                    type="button"
                    className="absolute top-2 left-9 flex h-5 w-5 items-center justify-center rounded bg-background/80 border border-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem(item);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                )}

                {/* Overlay with info */}
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="truncate text-xs font-medium text-background">
                    {item.originalName || item.filename}
                  </p>
                  <p className="text-xs text-background/70">
                    {formatFileSize(item.size)}
                    {item.width && item.height && ` • ${item.width}×${item.height}`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </PaginationItem>

            {generatePageNumbers(page, pagination.totalPages).map((pageNum, i) =>
              pageNum === '...' ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <span className="px-2 text-muted-foreground">...</span>
                </PaginationItem>
              ) : (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(pageNum as number);
                    }}
                    isActive={page === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Page info */}
      {pagination && (
        <p className="text-center text-sm text-muted-foreground">
          Visar {(page - 1) * pageSize + 1}-
          {Math.min(page * pageSize, pagination.total)} av {pagination.total} filer
        </p>
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages.map((item): LightboxImage => ({
          src: item.variants?.large || item.variants?.medium || item.url,
          alt: item.alt || item.filename,
          width: item.width ?? undefined,
          height: item.height ?? undefined,
          metadata: {
            filename: item.originalName || item.filename,
            size: item.size,
            dimensions:
              item.width && item.height
                ? `${item.width}×${item.height}`
                : undefined,
          },
        }))}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Media Item Editor */}
      <MediaItemEditor
        item={editingItem}
        categories={categories}
        open={editingItem !== null}
        onClose={() => setEditingItem(null)}
        onSave={() => mutate(apiUrl)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort bilder</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill ta bort {selectedIds.size}{' '}
              {selectedIds.size === 1 ? 'bild' : 'bilder'}? Detta går inte att ångra.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Generate page numbers with ellipsis for pagination
 */
function generatePageNumbers(
  current: number,
  total: number
): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total);
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }

  return pages;
}
