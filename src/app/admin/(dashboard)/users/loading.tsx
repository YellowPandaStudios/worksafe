import { PageContainer, PageHeader, TableRowSkeleton } from '@/components/admin/common';
import { Skeleton } from '@/components/ui/skeleton';

export default function UsersLoading(): React.ReactElement {
  return (
    <PageContainer>
      <PageHeader title="Användare" />
      <div className="space-y-4">
        {/* Search and filter skeleton */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Skeleton className="h-10 flex-1" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
        </div>
        {/* Table skeleton */}
        <div className="rounded-lg border">
          <div className="border-b p-4">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
            </div>
          </div>
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} columns={5} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
