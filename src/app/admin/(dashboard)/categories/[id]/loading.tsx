import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function EditCategoryLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Laddar kategori..."
        backLink={{ href: '/admin/categories', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={5} />
    </PageContainer>
  );
}
