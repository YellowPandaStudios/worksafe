import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function NewTestimonialLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Nytt omdöme"
        backLink={{ href: '/admin/testimonials', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={6} />
    </PageContainer>
  );
}
