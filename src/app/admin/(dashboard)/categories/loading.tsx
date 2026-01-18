import { PageContainer, PageHeader, CardSkeleton } from '@/components/admin/common';

export default function CategoriesLoading(): React.ReactElement {
  return (
    <PageContainer>
      <PageHeader
        title="Kategorier"
        description="Hantera kategorier för tjänster och innehåll. Kategorier bygger URL-strukturen."
      />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </PageContainer>
  );
}
