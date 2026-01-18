import { prisma } from '@/lib/prisma';
import { PageHeader, PageContainer } from '@/components/admin/common';
import { SettingsForm } from '@/components/admin/forms/SettingsForm';

export default async function SettingsPage(): Promise<React.ReactElement> {
  // Get or create default settings
  let settings = await prisma.siteSettings.findUnique({
    where: { id: 'default' },
  });

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        id: 'default',
        siteName: 'Work Safe',
      },
    });
  }

  return (
    <PageContainer>
      <PageHeader
        title="Inställningar"
        description="Hantera webbplatsens inställningar"
      />
      <SettingsForm
        initialData={{
          siteName: settings.siteName,
          siteTagline: settings.siteTagline,
          logo: settings.logo,
          favicon: settings.favicon,
          email: settings.email,
          phone: settings.phone,
          address: settings.address,
          orgNumber: settings.orgNumber,
          linkedIn: settings.linkedIn,
          facebook: settings.facebook,
          instagram: settings.instagram,
          defaultMetaTitle: settings.defaultMetaTitle,
          defaultMetaDescription: settings.defaultMetaDescription,
          defaultOgImage: settings.defaultOgImage,
          headScripts: settings.headScripts,
          bodyScripts: settings.bodyScripts,
          maintenanceMode: settings.maintenanceMode,
          maintenanceMessage: settings.maintenanceMessage,
        }}
      />
    </PageContainer>
  );
}
