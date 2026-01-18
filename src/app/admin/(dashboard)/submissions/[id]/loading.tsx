import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function SubmissionDetailLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Laddar inlämning..."
        backLink={{ href: '/admin/submissions', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={8} />
    </PageContainer>
  );
}
