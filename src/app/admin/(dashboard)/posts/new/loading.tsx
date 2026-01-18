import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function NewPostLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Nytt inlägg"
        backLink={{ href: '/admin/posts', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={6} />
    </PageContainer>
  );
}
