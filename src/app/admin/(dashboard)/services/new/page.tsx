import { EditPageLayoutWithEditor } from '@/components/admin/layouts';
import { ServiceForm } from '@/components/admin/forms/ServiceForm';

export default function NewServicePage() {
  return (
    <EditPageLayoutWithEditor variant="full">
      <ServiceForm />
    </EditPageLayoutWithEditor>
  );
}
