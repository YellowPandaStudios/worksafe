import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function EditProductLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Laddar produkt..."
        backLink={{ href: '/admin/products', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={8} />
    </PageContainer>
  );
}
