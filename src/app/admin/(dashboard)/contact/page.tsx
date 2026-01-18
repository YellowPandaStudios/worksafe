import Link from 'next/link';
import { Mail, Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { PageHeader, PageContainer, EmptyState } from '@/components/admin/common';
import { FormTemplatesList } from './FormTemplatesList';

export default async function ContactAdminPage(): Promise<React.ReactElement> {
  const templates = await prisma.formTemplate.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      preset: true,
      usageCount: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return (
    <PageContainer>
      <PageHeader
        title="Formulärmallar"
        description="Skapa och hantera återanvändbara formulärkonfigurationer"
        actions={
          <Button asChild>
            <Link href="/admin/contact/new">
              <Plus className="h-4 w-4 mr-2" />
              Ny mall
            </Link>
          </Button>
        }
      />
      {templates.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-12 w-12" />}
          title="Inga mallar ännu"
          description="Skapa din första formulärmall för att kunna återanvända formulärkonfigurationer i dina sidor och kampanjer."
          action={{
            label: 'Skapa första mallen',
            href: '/admin/contact/new',
          }}
        />
      ) : (
        <FormTemplatesList templates={templates} />
      )}
    </PageContainer>
  );
}
