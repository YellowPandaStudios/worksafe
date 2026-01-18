import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function NewPageLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Ny sida"
        backLink={{ href: '/admin/pages', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={6} />
    </PageContainer>
  );
}
