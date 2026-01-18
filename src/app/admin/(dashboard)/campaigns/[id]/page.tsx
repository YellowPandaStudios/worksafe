import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CampaignForm } from '@/components/admin/forms/CampaignForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCampaignPage({ params }: PageProps) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!campaign) {
    notFound();
  }

  return (
    <CampaignForm
      initialData={{
        ...campaign,
        startDate: campaign.startDate?.toISOString() || null,
        endDate: campaign.endDate?.toISOString() || null,
      }}
    />
  );
}
