import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function NewServiceLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Ny tjänst"
        backLink={{ href: '/admin/services', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={6} />
    </PageContainer>
  );
}
