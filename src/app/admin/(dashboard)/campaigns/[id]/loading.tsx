import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function EditCampaignLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Laddar kampanj..."
        backLink={{ href: '/admin/campaigns', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={6} />
    </PageContainer>
  );
}
