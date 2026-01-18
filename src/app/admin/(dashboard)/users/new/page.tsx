import { PageHeader, PageContainer } from '@/components/admin/common';
import { CreateUserForm } from './CreateUserForm';

export default function CreateUserPage(): React.ReactElement {
  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Skapa användare"
        description="Lägg till en ny användare i systemet"
        backLink={{ href: '/admin/users', label: 'Tillbaka' }}
      />
      <CreateUserForm />
    </PageContainer>
  );
}
