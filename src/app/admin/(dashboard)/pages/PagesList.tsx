'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column, type SortDirection } from '@/components/admin/lists/DataTable';
import { SearchAndFilter, type FilterOption } from '@/components/admin/lists/SearchAndFilter';
import { StatusBadge, getStatusLabel } from '@/components/admin/common';
import { Pencil, ChevronRight, Eye } from 'lucide-react';
import { format } from 'date-fns';

export interface PageRow {
  id: string;
  title: string;
  slug: string;
  path: string | null;
  pageType: string | null;
  status: string;
  updatedAt: Date;
  depth: number;
}

interface PagesListProps {
  pages: PageRow[];
}

export function PagesList({ pages }: PagesListProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const pageType = searchParams.get('pageType') || 'all';
  const status = searchParams.get('status') || 'all';
  const sortBy = searchParams.get('sortBy') || null;
  const sortDir = (searchParams.get('sortDir') || null) as SortDirection;

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
    router.push('/admin/pages');
  };

  const columns: Column<PageRow>[] = [
    {
      key: 'title',
      label: 'Titel',
      sortable: true,
      render: (_, row) => (
        <Link
          href={`/admin/pages/${row.id}`}
          className="font-medium hover:underline inline-flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          {row.depth > 0 && (
            <span
              className="text-muted-foreground mr-1"
              style={{ marginLeft: `${row.depth * 1.5}rem` }}
            >
              <ChevronRight className="h-3 w-3 inline-block" />
            </span>
          )}
          {String(row.title)}
        </Link>
      ),
    },
    {
      key: 'path',
      label: 'URL',
      render: (_, row) => (
        <span className="text-muted-foreground text-sm">
          {row.path || `/${row.slug}`}
        </span>
      ),
    },
    {
      key: 'pageType',
      label: 'Sidtyp',
      sortable: true,
      render: (value) =>
        value ? (
          <Badge variant="outline">{String(value)}</Badge>
        ) : (
          '-'
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
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" asChild>
            <Link href={row.path || `/${row.slug}`} target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/pages/${row.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: 'pageType',
      label: 'Sidtyp',
      options: [
        { value: 'home', label: 'Startsida' },
        { value: 'contact', label: 'Kontakt' },
        { value: 'about', label: 'Om oss' },
        { value: 'category_landing', label: 'Kategorilandningssida' },
      ],
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
        searchPlaceholder="Sök efter sidor..."
        filters={filters}
        filterValues={{ pageType, status }}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <DataTable
        data={pages}
        columns={columns}
        sortColumn={sortBy}
        sortDirection={sortDir}
        onSort={handleSort}
        onRowClick={(row) => {
          router.push(`/admin/pages/${row.id}`);
        }}
        emptyMessage="Inga sidor hittades"
      />
    </div>
  );
}
