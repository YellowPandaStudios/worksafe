'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column, type SortDirection } from '@/components/admin/lists/DataTable';
import { SearchAndFilter, type FilterOption } from '@/components/admin/lists/SearchAndFilter';
import { StatusBadge } from '@/components/admin/common';
import { Pencil, Quote } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_LABELS: Record<string, string> = {
  brandskydd: 'Brandskydd',
  utbildningar: 'Utbildningar',
  hjartstartare: 'Hjärtstartare',
  forsta_hjalpen: 'Första hjälpen',
};

export interface TestimonialRow {
  id: string;
  quote: string;
  name: string;
  role: string | null;
  company: string | null;
  image: string | null;
  serviceCategory: string | null;
  sortOrder: number;
  isActive: boolean;
  updatedAt: Date;
}

interface TestimonialsListProps {
  testimonials: TestimonialRow[];
}

export function TestimonialsList({ testimonials }: TestimonialsListProps): React.ReactElement {
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
    router.push('/admin/testimonials');
  };

  const columns: Column<TestimonialRow>[] = [
    {
      key: 'quote',
      label: 'Omdöme',
      render: (_, row) => (
        <Link
          href={`/admin/testimonials/${row.id}`}
          className="block max-w-md hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-2">
            <Quote className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <span className="line-clamp-2 text-sm">{row.quote}</span>
          </div>
        </Link>
      ),
    },
    {
      key: 'name',
      label: 'Person',
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          {(row.role || row.company) && (
            <div className="text-xs text-muted-foreground">
              {[row.role, row.company].filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'serviceCategory',
      label: 'Kategori',
      render: (value) =>
        value ? (
          <Badge variant="outline">
            {CATEGORY_LABELS[String(value)] || String(value)}
          </Badge>
        ) : (
          '-'
        ),
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <StatusBadge variant={value ? 'active' : 'inactive'} showDot>
          {value ? 'Aktiv' : 'Inaktiv'}
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
            <Link href={`/admin/testimonials/${row.id}`}>
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
        { value: 'active', label: 'Aktiv' },
        { value: 'inactive', label: 'Inaktiv' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <SearchAndFilter
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Sök efter namn, företag eller omdöme..."
        filters={filters}
        filterValues={{ category, status }}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <DataTable
        data={testimonials}
        columns={columns}
        sortColumn={sortBy}
        sortDirection={sortDir}
        onSort={handleSort}
        onRowClick={(row) => {
          router.push(`/admin/testimonials/${row.id}`);
        }}
        emptyMessage="Inga omdömen hittades"
      />
    </div>
  );
}
