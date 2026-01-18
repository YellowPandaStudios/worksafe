import { PageHeader, PageContainer } from '@/components/admin/common';
import { TestimonialForm } from '@/components/admin/forms/TestimonialForm';

export default function NewTestimonialPage(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Nytt omdöme"
        backLink={{ href: '/admin/testimonials', label: 'Tillbaka' }}
      />
      <TestimonialForm />
    </PageContainer>
  );
}
