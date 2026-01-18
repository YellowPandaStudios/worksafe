import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function NewProductLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Ny produkt"
        backLink={{ href: '/admin/products', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={8} />
    </PageContainer>
  );
}
