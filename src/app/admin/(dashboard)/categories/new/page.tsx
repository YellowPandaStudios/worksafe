import { PageHeader, PageContainer } from '@/components/admin/common';
import { CategoryForm } from '@/components/admin/forms/CategoryForm';

interface PageProps {
  searchParams: Promise<{ parentId?: string }>;
}

export default async function NewCategoryPage({ searchParams }: PageProps): Promise<React.ReactElement> {
  const { parentId } = await searchParams;

  // If parentId is provided, we could pre-select it in the form
  // For now, we just pass it as initial data
  const initialData = parentId
    ? {
        id: '',
        name: '',
        slug: '',
        description: null,
        parentId,
        path: '',
        type: 'sub_category',
        blocks: [],
        heroImage: null,
        metaTitle: null,
        metaDescription: null,
        ogImage: null,
        sortOrder: 0,
        isActive: true,
      }
    : null;

  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Ny kategori"
        backLink={{ href: '/admin/categories', label: 'Tillbaka' }}
      />
      <CategoryForm initialData={initialData} />
    </PageContainer>
  );
}
