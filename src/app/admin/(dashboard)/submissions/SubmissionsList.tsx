'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column, type SortDirection } from '@/components/admin/lists/DataTable';
import { SearchAndFilter, type FilterOption } from '@/components/admin/lists/SearchAndFilter';
import { Eye, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

const FORM_TYPE_LABELS: Record<string, string> = {
  contact: 'Kontakt',
  quote: 'Offertförfrågan',
  callback: 'Återuppringning',
  newsletter: 'Nyhetsbrev',
};

export interface SubmissionRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  formType: string | null;
  page: string | null;
  serviceCategory: string | null;
  createdAt: Date;
}

interface SubmissionsListProps {
  submissions: SubmissionRow[];
}

export function SubmissionsList({ submissions }: SubmissionsListProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const formType = searchParams.get('formType') || 'all';
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
    router.push('/admin/submissions');
  };

  const columns: Column<SubmissionRow>[] = [
    {
      key: 'name',
      label: 'Från',
      sortable: true,
      render: (_, row) => (
        <Link
          href={`/admin/submissions/${row.id}`}
          className="block hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-medium">
            {row.name}
            {row.company && (
              <span className="text-muted-foreground font-normal">, {row.company}</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {row.email}
            </span>
            {row.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {row.phone}
              </span>
            )}
          </div>
        </Link>
      ),
    },
    {
      key: 'message',
      label: 'Meddelande',
      render: (value) =>
        value ? (
          <span className="text-sm text-muted-foreground line-clamp-2 max-w-md">
            {String(value)}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: 'formType',
      label: 'Typ',
      render: (value) =>
        value ? (
          <Badge variant="outline">
            {FORM_TYPE_LABELS[String(value)] || String(value)}
          </Badge>
        ) : (
          '-'
        ),
    },
    {
      key: 'createdAt',
      label: 'Mottagen',
      sortable: true,
      render: (value) => (
        <span className="text-sm">
          {format(new Date(value as Date), 'PPp', { locale: sv })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (_, row) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/submissions/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: 'formType',
      label: 'Typ',
      options: Object.entries(FORM_TYPE_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
  ];

  return (
    <div className="space-y-4">
      <SearchAndFilter
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Sök efter namn, e-post, företag eller meddelande..."
        filters={filters}
        filterValues={{ formType }}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <DataTable
        data={submissions}
        columns={columns}
        sortColumn={sortBy}
        sortDirection={sortDir}
        onSort={handleSort}
        onRowClick={(row) => {
          router.push(`/admin/submissions/${row.id}`);
        }}
        emptyMessage="Inga inlämningar hittades"
      />
    </div>
  );
}
