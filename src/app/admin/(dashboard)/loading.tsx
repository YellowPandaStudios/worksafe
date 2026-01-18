import { PageContainer, PageHeader, StatCardGrid } from '@/components/admin/common';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading(): React.ReactElement {
  return (
    <PageContainer>
      <PageHeader title="Dashboard" />
      <StatCardGrid columns={4}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </StatCardGrid>
    </PageContainer>
  );
}
