import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageHeader, PageContainer } from '@/components/admin/common';
import { TestimonialForm } from '@/components/admin/forms/TestimonialForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTestimonialPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
  });

  if (!testimonial) {
    notFound();
  }

  return (
    <PageContainer variant="narrow">
      <PageHeader
        title={`Redigera: ${testimonial.name}`}
        backLink={{ href: '/admin/testimonials', label: 'Tillbaka' }}
      />
      <TestimonialForm
        initialData={{
          id: testimonial.id,
          quote: testimonial.quote,
          name: testimonial.name,
          role: testimonial.role,
          company: testimonial.company,
          image: testimonial.image,
          imageAlt: testimonial.imageAlt,
          serviceCategory: testimonial.serviceCategory,
          sortOrder: testimonial.sortOrder,
          isActive: testimonial.isActive,
        }}
      />
    </PageContainer>
  );
}
