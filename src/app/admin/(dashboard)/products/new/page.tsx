import { PageHeader, PageContainer } from '@/components/admin/common';
import { ProductForm } from '@/components/admin/forms/ProductForm';

export default function NewProductPage(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Ny produkt"
        backLink={{ href: '/admin/products', label: 'Tillbaka' }}
      />
      <ProductForm />
    </PageContainer>
  );
}
