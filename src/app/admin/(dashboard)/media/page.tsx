import type { Metadata } from 'next';
import { PageHeader, PageContainer } from '@/components/admin/common';
import { MediaLibrary } from '@/components/admin/media';

export const metadata: Metadata = {
  title: 'Media',
  description: 'Hantera bilder och filer',
};

export default function AdminMediaPage(): React.ReactElement {
  return (
    <PageContainer>
      <PageHeader
        title="Mediabibliotek"
        description="Ladda upp, sök och hantera bilder och filer."
      />
      <MediaLibrary pageSize={24} />
    </PageContainer>
  );
}
