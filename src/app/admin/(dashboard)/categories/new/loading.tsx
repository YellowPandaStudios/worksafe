import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function NewCategoryLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Ny kategori"
        backLink={{ href: '/admin/categories', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={5} />
    </PageContainer>
  );
}
