import { PageContainer, PageHeader, DataCardGridSkeleton } from '@/components/admin/common';
import { Skeleton } from '@/components/ui/skeleton';

export default function MediaLoading(): React.ReactElement {
  return (
    <PageContainer>
      <PageHeader
        title="Mediabibliotek"
        description="Ladda upp, sök och hantera bilder och filer."
      />
      <div className="space-y-4">
        {/* Search skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        {/* Grid skeleton */}
        <DataCardGridSkeleton count={12} columns={4} showImage />
      </div>
    </PageContainer>
  );
}
