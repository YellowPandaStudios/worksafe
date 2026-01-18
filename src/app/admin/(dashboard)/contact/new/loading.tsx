import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function NewFormTemplateLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Ny formulärmall"
        description="Skapa en ny återanvändbar formulärkonfiguration"
        backLink={{ href: '/admin/contact', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={8} />
    </PageContainer>
  );
}
