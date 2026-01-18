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

const GOAL_LABELS: Record<string, string> = {
  lead_gen: 'Leadgenerering',
  awareness: 'Medvetenhet',
  product_sale: 'Produktförsäljning',
  event_signup: 'Evenemangsregistrering',
};

export interface CampaignRow {
  id: string;
  name: string;
  slug: string;
  goal: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  updatedAt: Date;
}

interface CampaignsListProps {
  campaigns: CampaignRow[];
}

export function CampaignsList({ campaigns }: CampaignsListProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const goal = searchParams.get('goal') || 'all';
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
    router.push('/admin/campaigns');
  };

  const columns: Column<CampaignRow>[] = [
    {
      key: 'name',
      label: 'Namn',
      sortable: true,
      render: (_, row) => (
        <Link
          href={`/admin/campaigns/${row.id}`}
          className="font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {String(row.name)}
        </Link>
      ),
    },
    {
      key: 'goal',
      label: 'Mål',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">
          {GOAL_LABELS[String(value)] || String(value)}
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
      key: 'startDate',
      label: 'Startdatum',
      sortable: true,
      render: (value) => (value ? format(new Date(value as Date), 'PP') : '-'),
    },
    {
      key: 'endDate',
      label: 'Slutdatum',
      sortable: true,
      render: (value) => (value ? format(new Date(value as Date), 'PP') : '-'),
    },
    {
      key: 'actions',
      label: 'Åtgärder',
      className: 'text-right',
      render: (_, row) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/campaigns/${row.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: 'goal',
      label: 'Mål',
      options: Object.entries(GOAL_LABELS).map(([value, label]) => ({
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
        searchPlaceholder="Sök efter kampanjer..."
        filters={filters}
        filterValues={{ goal, status }}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <DataTable
        data={campaigns}
        columns={columns}
        sortColumn={sortBy}
        sortDirection={sortDir}
        onSort={handleSort}
        onRowClick={(row) => {
          router.push(`/admin/campaigns/${row.id}`);
        }}
        emptyMessage="Inga kampanjer hittades"
      />
    </div>
  );
}
