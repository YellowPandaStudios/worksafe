import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageForm } from '@/components/admin/forms/PageForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPagePage({ params }: PageProps) {
  const { id } = await params;
  const page = await prisma.page.findUnique({
    where: { id },
  });

  if (!page) {
    notFound();
  }

  return (
    <PageForm
      initialData={{
        ...page,
        publishedAt: page.publishedAt?.toISOString() || null,
      }}
    />
  );
}
