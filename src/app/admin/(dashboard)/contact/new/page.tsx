import { PageHeader, PageContainer } from '@/components/admin/common';
import { FormTemplateForm } from '@/components/admin/forms/FormTemplateForm';

export default function NewFormTemplatePage(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Ny formulärmall"
        description="Skapa en ny återanvändbar formulärkonfiguration"
        backLink={{ href: '/admin/contact', label: 'Tillbaka' }}
      />
      <FormTemplateForm isNew />
    </PageContainer>
  );
}
