import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditUserLoading(): React.ReactElement {
  return (
    <PageContainer>
      <PageHeader
        title="Laddar användare..."
        backLink={{ href: '/admin/users', label: 'Tillbaka' }}
      />
      {/* Tabs skeleton */}
      <div className="space-y-6">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <FormSkeleton fields={6} />
      </div>
    </PageContainer>
  );
}
