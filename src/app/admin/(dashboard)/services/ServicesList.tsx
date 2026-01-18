'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column, type SortDirection } from '@/components/admin/lists/DataTable';
import { SearchAndFilter, type FilterOption } from '@/components/admin/lists/SearchAndFilter';
import { StatusBadge, getStatusLabel } from '@/components/admin/common';
import { Pencil } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_LABELS: Record<string, string> = {
  brandskydd: 'Brandskydd',
  utbildningar: 'Utbildningar',
  hjartstartare: 'Hjärtstartare',
  forsta_hjalpen: 'Första hjälpen',
};

export interface ServiceRow {
  id: string;
  title: string;
  slug: string;
  categoryId: string | null;
  categoryName: string | null;
  status: string;
  updatedAt: Date;
}

interface ServicesListProps {
  services: ServiceRow[];
}

export function ServicesList({ services }: ServicesListProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const status = searchParams.get('status') || 'all';
  const sortBy = searchParams.get('sortBy') || null;
  const sortDir = (searchParams.get('sortDir') || null) as SortDirection;

  const handleSearchChange = useCallback((value: string): void => {
    const currentSearch = searchParams.get('search') || '';
    if (value === currentSearch) {
      return; // No change, avoid unnecessary navigation
    }
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.replace(`?${params.toString()}`);
  }, [searchParams, router]);

  const handleFilterChange = useCallback((key: string, value: string): void => {
    const currentValue = searchParams.get(key) || 'all';
    if (value === currentValue) {
      return; // No change, avoid unnecessary navigation
    }
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`?${params.toString()}`);
  }, [searchParams, router]);

  const handleSort = useCallback((column: string): void => {
    const params = new URLSearchParams(searchParams);
    let newSortBy: string | null = null;
    let newSortDir: 'asc' | 'desc' | null = null;

    if (sortBy === column) {
      if (sortDir === 'asc') {
        newSortDir = 'desc';
        newSortBy = column;
      } else if (sortDir === 'desc') {
        newSortBy = null;
        newSortDir = null;
      } else {
        newSortBy = column;
        newSortDir = 'asc';
      }
    } else {
      newSortBy = column;
      newSortDir = 'asc';
    }

    // Check if actually changed
    const currentSortBy = searchParams.get('sortBy');
    const currentSortDir = searchParams.get('sortDir');
    if (newSortBy === currentSortBy && newSortDir === currentSortDir) {
      return;
    }

    if (newSortBy) {
      params.set('sortBy', newSortBy);
      if (newSortDir) {
        params.set('sortDir', newSortDir);
      }
    } else {
      params.delete('sortBy');
      params.delete('sortDir');
    }
    router.replace(`?${params.toString()}`);
  }, [searchParams, router, sortBy, sortDir]);

  const handleClearFilters = useCallback((): void => {
    router.replace('/admin/services');
  }, [router]);

  const columns: Column<ServiceRow>[] = [
    {
      key: 'title',
      label: 'Titel',
      sortable: true,
      render: (_, row) => (
        <Link
          href={`/admin/services/${row.id}`}
          className="font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {String(row.title)}
        </Link>
      ),
    },
    {
      key: 'categoryName',
      label: 'Kategori',
      sortable: false,
      render: (value) => (
        <Badge variant="outline">
          {CATEGORY_LABELS[String(value)] || String(value)}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <StatusBadge variant={value as 'draft' | 'published' | 'archived'} showDot>
          {getStatusLabel(value as string)}
        </StatusBadge>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Uppdaterad',
      sortable: true,
      render: (value) => format(new Date(value as Date), 'PPp'),
    },
    {
      key: 'actions',
      label: 'Åtgärder',
      className: 'text-right',
      render: (_, row) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/services/${row.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: 'category',
      label: 'Kategori',
      options: Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'published', label: 'Publicerad' },
        { value: 'draft', label: 'Utkast' },
        { value: 'archived', label: 'Arkiverad' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <SearchAndFilter
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Sök efter tjänster..."
        filters={filters}
        filterValues={{ category, status }}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <DataTable
        data={services}
        columns={columns}
        sortColumn={sortBy}
        sortDirection={sortDir}
        onSort={handleSort}
        onRowClick={(row) => {
          router.push(`/admin/services/${row.id}`);
        }}
        emptyMessage="Inga tjänster hittades"
      />
    </div>
  );
}
