'use client';

import { useRouter, useSearchParams } from 'next/navigation';
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

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  categoryId: string | null;
  price: number | null;
  status: string;
  updatedAt: Date;
}

interface ProductsListProps {
  products: ProductRow[];
}

export function ProductsList({ products }: ProductsListProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
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
    router.push('/admin/products');
  };

  const columns: Column<ProductRow>[] = [
    {
      key: 'name',
      label: 'Namn',
      sortable: true,
      render: (_, row) => (
        <Link
          href={`/admin/products/${row.id}`}
          className="font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {String(row.name)}
        </Link>
      ),
    },
    {
      key: 'sku',
      label: 'SKU',
      sortable: true,
      render: (value) => (value ? String(value) : '-'),
    },
    {
      key: 'categoryId',
      label: 'Kategori',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">
          {CATEGORY_LABELS[String(value)] || String(value)}
        </Badge>
      ),
    },
    {
      key: 'price',
      label: 'Pris',
      sortable: true,
      render: (value) => (value ? `${value} SEK` : '-'),
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
            <Link href={`/admin/products/${row.id}`}>
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
        searchPlaceholder="Sök efter produkter..."
        filters={filters}
        filterValues={{ category, status }}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <DataTable
        data={products}
        columns={columns}
        sortColumn={sortBy}
        sortDirection={sortDir}
        onSort={handleSort}
        onRowClick={(row) => {
          router.push(`/admin/products/${row.id}`);
        }}
        emptyMessage="Inga produkter hittades"
      />
    </div>
  );
}
