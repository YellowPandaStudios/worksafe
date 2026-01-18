import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function EditFormTemplateLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Laddar formulärmall..."
        description="Uppdatera formulärmallens inställningar"
        backLink={{ href: '/admin/contact', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={8} />
    </PageContainer>
  );
}
