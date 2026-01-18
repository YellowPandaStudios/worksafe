import { HeadphonesIcon } from 'lucide-react';
import { PageHeader, PageContainer, EmptyState } from '@/components/admin/common';

export default function SupportPage(): React.ReactElement {
  return (
    <PageContainer>
      <PageHeader
        title="Support"
        description="Hantera supportsidor och FAQ-innehåll"
      />
      <EmptyState
        icon={<HeadphonesIcon className="h-12 w-12" />}
        title="Kommer snart"
        description="Här kommer du kunna hantera supportsidor, FAQ-artiklar och hjälpinnehåll med egna mallar och strukturer."
      />
    </PageContainer>
  );
}
