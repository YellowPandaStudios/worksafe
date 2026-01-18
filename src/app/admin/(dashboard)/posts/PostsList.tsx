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

export interface PostRow {
  id: string;
  title: string;
  slug: string;
  category: { name: string } | null;
  author: { name: string | null } | null;
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
}

interface PostsListProps {
  posts: PostRow[];
  categories: Array<{ id: string; name: string }>;
  authors: Array<{ id: string; name: string | null }>;
}

export function PostsList({ posts, categories, authors }: PostsListProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const status = searchParams.get('status') || 'all';
  const author = searchParams.get('author') || 'all';
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
    router.push('/admin/posts');
  };

  const columns: Column<PostRow>[] = [
    {
      key: 'title',
      label: 'Titel',
      sortable: true,
      render: (_, row) => (
        <Link
          href={`/admin/posts/${row.id}`}
          className="font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {String(row.title)}
        </Link>
      ),
    },
    {
      key: 'category',
      label: 'Kategori',
      sortable: false,
      render: (value) => {
        const category = value as { name: string } | null;
        return category ? (
          <Badge variant="outline">{category.name}</Badge>
        ) : (
          '-'
        );
      },
    },
    {
      key: 'author',
      label: 'Författare',
      sortable: false,
      render: (value) => {
        const author = value as { name: string | null } | null;
        return author?.name || '-';
      },
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
      key: 'publishedAt',
      label: 'Publicerad',
      sortable: true,
      render: (value) =>
        value ? format(new Date(value as Date), 'PPp') : '-',
    },
    {
      key: 'actions',
      label: 'Åtgärder',
      className: 'text-right',
      render: (_, row) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/posts/${row.id}`}>
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
      options: categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
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
    {
      key: 'author',
      label: 'Författare',
      options: authors
        .filter((a) => a.name)
        .map((auth) => ({
          value: auth.id,
          label: auth.name || '',
        })),
    },
  ];

  return (
    <div className="space-y-4">
      <SearchAndFilter
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Sök efter inlägg..."
        filters={filters}
        filterValues={{ category, status, author }}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <DataTable
        data={posts}
        columns={columns}
        sortColumn={sortBy}
        sortDirection={sortDir}
        onSort={handleSort}
        onRowClick={(row) => {
          router.push(`/admin/posts/${row.id}`);
        }}
        emptyMessage="Inga inlägg hittades"
      />
    </div>
  );
}
