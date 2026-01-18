import { PageContainer, PageHeader, FormSkeleton } from '@/components/admin/common';

export default function NewUserLoading(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Skapa användare"
        description="Lägg till en ny användare i systemet"
        backLink={{ href: '/admin/users', label: 'Tillbaka' }}
      />
      <FormSkeleton fields={5} />
    </PageContainer>
  );
}
