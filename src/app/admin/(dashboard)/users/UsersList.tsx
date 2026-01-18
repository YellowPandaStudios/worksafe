'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column, type SortDirection } from '@/components/admin/lists/DataTable';
import { SearchAndFilter, type FilterOption } from '@/components/admin/lists/SearchAndFilter';
import { Pencil, Shield, ShieldOff } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Redaktör',
  author: 'Författare',
  customer: 'Kund',
};

const ROLE_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  super_admin: 'destructive',
  admin: 'default',
  editor: 'secondary',
  author: 'secondary',
  customer: 'outline',
};

const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  private: 'Privat',
  business: 'Företag',
};

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  customerType: string;
  twoFactorEnabled: boolean;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UsersListProps {
  users: UserRow[];
}

export function UsersList({ users }: UsersListProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || 'all';
  const customerType = searchParams.get('customerType') || 'all';
  const twoFactorStatus = searchParams.get('twoFactorStatus') || 'all';
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
    router.push('/admin/users');
  };

  const columns: Column<UserRow>[] = [
    {
      key: 'name',
      label: 'Namn',
      sortable: true,
      render: (_, row) => (
        <Link
          href={`/admin/users/${row.id}`}
          className="font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {row.name}
        </Link>
      ),
    },
    {
      key: 'email',
      label: 'E-post',
      sortable: true,
      render: (value) => (
        <span className="text-muted-foreground">{String(value)}</span>
      ),
    },
    {
      key: 'role',
      label: 'Roll',
      sortable: true,
      render: (value) => (
        <Badge variant={ROLE_VARIANTS[String(value)] || 'outline'}>
          {ROLE_LABELS[String(value)] || String(value)}
        </Badge>
      ),
    },
    {
      key: 'customerType',
      label: 'Typ',
      sortable: true,
      render: (value) => (
        <span className="text-sm">
          {CUSTOMER_TYPE_LABELS[String(value)] || String(value)}
        </span>
      ),
    },
    {
      key: 'twoFactorEnabled',
      label: '2FA',
      sortable: true,
      render: (value) => (
        <div className="flex items-center justify-center" title={value ? '2FA aktiverad' : '2FA ej aktiverad'}>
          {value ? (
            <Shield className="h-4 w-4 text-green-600" />
          ) : (
            <ShieldOff className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      ),
    },
    {
      key: 'totalOrders',
      label: 'Ordrar',
      sortable: true,
      render: (value) => (
        <span className="tabular-nums">{String(value)}</span>
      ),
    },
    {
      key: 'totalSpent',
      label: 'Totalt spenderat',
      sortable: true,
      render: (value) => (
        <span className="tabular-nums">
          {new Intl.NumberFormat('sv-SE', {
            style: 'currency',
            currency: 'SEK',
            maximumFractionDigits: 0,
          }).format(Number(value))}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Registrerad',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(value as Date), 'PP', { locale: sv })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Åtgärder',
      className: 'text-right',
      render: (_, row) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/users/${row.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: 'role',
      label: 'Roll',
      options: Object.entries(ROLE_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      key: 'customerType',
      label: 'Kundtyp',
      options: Object.entries(CUSTOMER_TYPE_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      key: 'twoFactorStatus',
      label: '2FA Status',
      options: [
        { value: 'enabled', label: 'Aktiverad' },
        { value: 'disabled', label: 'Ej aktiverad' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <SearchAndFilter
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Sök efter namn, e-post eller företag..."
        filters={filters}
        filterValues={{ role, customerType, twoFactorStatus }}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <DataTable
        data={users}
        columns={columns}
        sortColumn={sortBy}
        sortDirection={sortDir}
        onSort={handleSort}
        onRowClick={(row) => {
          router.push(`/admin/users/${row.id}`);
        }}
        emptyMessage="Inga användare hittades"
      />
    </div>
  );
}
