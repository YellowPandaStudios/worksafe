import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageHeader, PageContainer } from '@/components/admin/common';
import { FormTemplateForm } from '@/components/admin/forms/FormTemplateForm';
import type { FormFieldConfig, CategoryOption } from '@/types/blocks';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFormTemplatePage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;

  const template = await prisma.formTemplate.findUnique({
    where: { id },
  });

  if (!template) {
    notFound();
  }

  // Convert Prisma data to form data format
  const formData = {
    id: template.id,
    name: template.name,
    slug: template.slug,
    description: template.description,
    preset: template.preset as 'contact' | 'quote' | 'callback' | 'newsletter',
    fields: template.fields as unknown as FormFieldConfig[],
    categoryMode: template.categoryMode as 'system' | 'custom' | 'hidden',
    categoryLabel: template.categoryLabel,
    customCategories: template.customCategories as unknown as CategoryOption[],
    submitButtonText: template.submitButtonText,
    successMessage: template.successMessage,
    defaultTitle: template.defaultTitle,
    defaultSubtitle: template.defaultSubtitle,
    isActive: template.isActive,
  };

  return (
    <PageContainer variant="narrow">
      <PageHeader
        title={`Redigera: ${template.name}`}
        description="Uppdatera formulärmallens inställningar"
        backLink={{ href: '/admin/contact', label: 'Tillbaka' }}
      />
      <FormTemplateForm initialData={formData} isNew={false} />
    </PageContainer>
  );
}
