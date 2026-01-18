import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function NewCampaignLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Ny kampanj"
        backLink={{ href: '/admin/campaigns', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={6} />
    </PageContainer>
  );
}
