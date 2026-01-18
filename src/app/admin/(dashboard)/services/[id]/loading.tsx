import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function EditServiceLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Laddar tjänst..."
        backLink={{ href: '/admin/services', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={6} />
    </PageContainer>
  );
}
