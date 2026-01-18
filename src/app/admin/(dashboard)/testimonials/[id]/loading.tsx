import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function EditTestimonialLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Laddar omdöme..."
        backLink={{ href: '/admin/testimonials', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={6} />
    </PageContainer>
  );
}
