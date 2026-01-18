import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageHeader, PageContainer } from '@/components/admin/common';
import { CategoryForm } from '@/components/admin/forms/CategoryForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  return (
    <PageContainer variant="narrow">
      <PageHeader
        title={`Redigera: ${category.name}`}
        backLink={{ href: '/admin/categories', label: 'Tillbaka' }}
      />
      <CategoryForm initialData={category} />
    </PageContainer>
  );
}
