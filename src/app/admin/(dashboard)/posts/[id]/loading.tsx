import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function EditPostLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Laddar inlägg..."
        backLink={{ href: '/admin/posts', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={6} />
    </PageContainer>
  );
}
