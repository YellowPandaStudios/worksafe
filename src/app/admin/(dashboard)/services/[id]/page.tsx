import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { EditPageLayoutWithEditor } from '@/components/admin/layouts';
import { ServiceForm } from '@/components/admin/forms/ServiceForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: PageProps) {
  const { id } = await params;
  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    notFound();
  }

  return (
    <EditPageLayoutWithEditor variant="full">
      <ServiceForm
        initialData={{
          ...service,
          contentBlocks: service.contentBlocks,
          features: service.features,
          sidebarItems: service.sidebarItems,
          faqItems: service.faqItems,
          relatedServiceIds: service.relatedServiceIds,
          publishedAt: service.publishedAt?.toISOString() || null,
          scheduledFor: service.scheduledFor?.toISOString() || null,
          // Hero buttons
          heroButtonsEnabled: service.heroButtonsEnabled,
          heroPrimaryButtonText: service.heroPrimaryButtonText,
          heroPrimaryButtonLink: service.heroPrimaryButtonLink,
          heroSecondaryButtonText: service.heroSecondaryButtonText,
          heroSecondaryButtonLink: service.heroSecondaryButtonLink,
        }}
      />
    </EditPageLayoutWithEditor>
  );
}
