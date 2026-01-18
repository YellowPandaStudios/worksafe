import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageHeader, PageContainer } from '@/components/admin/common';
import { DetailSection, DetailItem, DetailGrid } from '@/components/admin/common';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface PageProps {
  params: Promise<{ id: string }>;
}

const FORM_TYPE_LABELS: Record<string, string> = {
  contact: 'Kontakt',
  quote: 'Offertförfrågan',
  callback: 'Återuppringning',
  newsletter: 'Nyhetsbrev',
};

export default async function SubmissionDetailPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  
  const submission = await prisma.formSubmission.findUnique({
    where: { id },
    include: {
      campaign: {
        select: { name: true },
      },
    },
  });

  if (!submission) {
    notFound();
  }

  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Formulärinlämning"
        description={`Mottagen ${format(submission.createdAt, 'PPPp', { locale: sv })}`}
        backLink={{ href: '/admin/submissions', label: 'Tillbaka' }}
      />

      <div className="space-y-6">
        <DetailSection title="Kontaktuppgifter">
          <DetailGrid>
            <DetailItem label="Namn" value={submission.name} />
            <DetailItem label="E-post" value={submission.email} />
            <DetailItem label="Telefon" value={submission.phone || '-'} />
            <DetailItem label="Företag" value={submission.company || '-'} />
            {submission.orgNumber && (
              <DetailItem label="Org.nummer" value={submission.orgNumber} />
            )}
          </DetailGrid>
        </DetailSection>

        {submission.message && (
          <DetailSection title="Meddelande">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="whitespace-pre-wrap">{submission.message}</p>
            </div>
          </DetailSection>
        )}

        <DetailSection title="Formulärdetaljer">
          <DetailGrid>
            <DetailItem 
              label="Formulärtyp" 
              value={
                submission.formType 
                  ? FORM_TYPE_LABELS[submission.formType] || submission.formType
                  : '-'
              } 
            />
            <DetailItem label="Sida" value={submission.page || '-'} />
            <DetailItem label="Tjänstekategori" value={submission.serviceCategory || '-'} />
            {submission.campaign && (
              <DetailItem label="Kampanj" value={submission.campaign.name} />
            )}
          </DetailGrid>
        </DetailSection>

        {(submission.utmSource || submission.utmMedium || submission.utmCampaign) && (
          <DetailSection title="UTM-spårning">
            <DetailGrid>
              <DetailItem label="Källa" value={submission.utmSource || '-'} />
              <DetailItem label="Medium" value={submission.utmMedium || '-'} />
              <DetailItem label="Kampanj" value={submission.utmCampaign || '-'} />
              <DetailItem label="Term" value={submission.utmTerm || '-'} />
              <DetailItem label="Innehåll" value={submission.utmContent || '-'} />
            </DetailGrid>
          </DetailSection>
        )}

        <DetailSection title="Teknisk information">
          <DetailGrid>
            <DetailItem label="Referrer" value={submission.referrer || '-'} />
            <DetailItem 
              label="Marknadsföringssamtycke" 
              value={submission.marketingConsent ? 'Ja' : 'Nej'} 
            />
            {submission.hubspotId && (
              <DetailItem label="HubSpot ID" value={submission.hubspotId} />
            )}
          </DetailGrid>
        </DetailSection>
      </div>
    </PageContainer>
  );
}
