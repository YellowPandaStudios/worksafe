import { PageContainer, PageHeader, TableRowSkeleton } from '@/components/admin/common';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContactLoading(): React.ReactElement {
  return (
    <PageContainer>
      <PageHeader
        title="Formulärmallar"
        description="Skapa och hantera återanvändbara formulärkonfigurationer"
      />
      <div className="space-y-4">
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
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRowSkeleton key={i} columns={4} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
