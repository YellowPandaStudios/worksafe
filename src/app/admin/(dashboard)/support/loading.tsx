import { PageContainer, PageHeader, LoadingState } from '@/components/admin/common';

export default function SupportLoading(): React.ReactElement {
  return (
    <PageContainer>
      <PageHeader
        title="Support"
        description="Hantera supportsidor och FAQ-innehåll"
      />
      <LoadingState text="Laddar..." />
    </PageContainer>
  );
}
