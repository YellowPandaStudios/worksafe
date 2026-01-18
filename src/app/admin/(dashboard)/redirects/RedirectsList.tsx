'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column, type SortDirection } from '@/components/admin/lists/DataTable';
import { SearchAndFilter, type FilterOption } from '@/components/admin/lists/SearchAndFilter';
import { ConfirmDialog, useConfirmDialog } from '@/components/admin/common';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RedirectForm } from '@/components/admin/forms/RedirectForm';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

export interface RedirectRow {
  id: string;
  from: string;
  to: string;
  type: string;
  hitCount: number;
  lastHitAt: Date | null;
  note: string | null;
  createdAt: Date;
}

interface RedirectsListProps {
  redirects: RedirectRow[];
}

export function RedirectsList({ redirects }: RedirectsListProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<RedirectRow | null>(null);

  const search = searchParams.get('search') || '';
  const type = searchParams.get('type') || 'all';
  const sortBy = searchParams.get('sortBy') || null;
  const sortDir = (searchParams.get('sortDir') || null) as SortDirection;

  const handleDelete = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/redirects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('Redirect borttagen');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete redirect:', error);
      toast.error('Kunde inte ta bort redirect');
    }
  };

  const { dialogProps, confirm: confirmDelete } = useConfirmDialog<string>({
    title: 'Ta bort redirect?',
    description: 'Är du säker på att du vill ta bort denna redirect? Detta kan inte ångras.',
    confirmLabel: 'Ta bort',
    variant: 'danger',
    onConfirm: handleDelete,
  });

  const handleSearchChange = (value: string): void => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string): void => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const handleSort = (column: string): void => {
    const params = new URLSearchParams(searchParams);
    if (sortBy === column) {
      if (sortDir === 'asc') {
        params.set('sortDir', 'desc');
      } else if (sortDir === 'desc') {
        params.delete('sortBy');
        params.delete('sortDir');
      } else {
        params.set('sortBy', column);
        params.set('sortDir', 'asc');
      }
    } else {
      params.set('sortBy', column);
      params.set('sortDir', 'asc');
    }
    router.push(`?${params.toString()}`);
  };

  const handleClearFilters = (): void => {
    router.push('/admin/redirects');
  };

  const handleFormSuccess = (): void => {
    setShowCreateDialog(false);
    setEditingRedirect(null);
    router.refresh();
  };

  const columns: Column<RedirectRow>[] = [
    {
      key: 'from',
      label: 'Från',
      sortable: true,
      render: (_, row) => (
        <button
          className="text-left font-mono text-sm hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            setEditingRedirect(row);
          }}
        >
          {row.from}
        </button>
      ),
    },
    {
      key: 'to',
      label: 'Till',
      render: (_, row) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <ArrowRight className="h-4 w-4 shrink-0" />
          <span className="font-mono text-sm truncate max-w-xs">{row.to}</span>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Typ',
      sortable: true,
      render: (value) => (
        <Badge variant={value === 'permanent' ? 'default' : 'secondary'}>
          {value === 'permanent' ? '301' : '302'}
        </Badge>
      ),
    },
    {
      key: 'hitCount',
      label: 'Träffar',
      sortable: true,
      render: (value) => (
        <span className="tabular-nums">{String(value)}</span>
      ),
    },
    {
      key: 'lastHitAt',
      label: 'Senast använd',
      sortable: true,
      render: (value) =>
        value ? (
          <span className="text-sm text-muted-foreground">
            {format(new Date(value as Date), 'PP', { locale: sv })}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (_, row) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => confirmDelete(row.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: 'type',
      label: 'Typ',
      options: [
        { value: 'permanent', label: '301 (Permanent)' },
        { value: 'temporary', label: '302 (Tillfällig)' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchAndFilter
          searchValue={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Sök efter URL..."
          filters={filters}
          filterValues={{ type }}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          className="flex-1"
        />
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ny redirect
        </Button>
      </div>

      <DataTable
        data={redirects}
        columns={columns}
        sortColumn={sortBy}
        sortDirection={sortDir}
        onSort={handleSort}
        onRowClick={(row) => setEditingRedirect(row)}
        emptyMessage="Inga redirects hittades"
      />

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ny redirect</DialogTitle>
            <DialogDescription>Lägg till en ny URL-omdirigering</DialogDescription>
          </DialogHeader>
          <RedirectForm onSuccess={handleFormSuccess} onCancel={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingRedirect} onOpenChange={(open) => !open && setEditingRedirect(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redigera redirect</DialogTitle>
            <DialogDescription>Uppdatera URL-omdirigeringen</DialogDescription>
          </DialogHeader>
          {editingRedirect && (
            <RedirectForm
              initialData={editingRedirect}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingRedirect(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
