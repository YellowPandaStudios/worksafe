import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function EditPageLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Laddar sida..."
        backLink={{ href: '/admin/pages', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={6} />
    </PageContainer>
  );
}
