import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading(): React.ReactElement {
  return (
    <PageContainer>
      <PageHeader
        title="Inställningar"
        description="Hantera webbplatsens inställningar"
      />
      <div className="space-y-6">
        {/* Tabs skeleton */}
        <div className="grid w-full grid-cols-5 gap-1 rounded-lg bg-muted p-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9" />
          ))}
        </div>
        {/* Form skeleton */}
        <FormSkeleton fields={8} />
      </div>
    </PageContainer>
  );
}
