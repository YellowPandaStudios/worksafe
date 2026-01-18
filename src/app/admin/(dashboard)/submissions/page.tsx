import { Inbox } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { PageHeader, PageContainer, EmptyState } from '@/components/admin/common';
import { SubmissionsList, type SubmissionRow } from './SubmissionsList';

interface SubmissionsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SubmissionsPage({ searchParams }: SubmissionsPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const search = (params.search as string) || '';
  const formType = (params.formType as string) || '';
  const sortBy = (params.sortBy as string) || null;
  const sortDir = (params.sortDir as 'asc' | 'desc') || null;

  // Build where clause
  const where: Prisma.FormSubmissionWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (formType && formType !== 'all') {
    where.formType = formType;
  }

  // Build orderBy clause
  const orderBy =
    sortBy && sortDir
      ? { [sortBy]: sortDir }
      : { createdAt: 'desc' as const };

  const rawSubmissions = await prisma.formSubmission.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      message: true,
      formType: true,
      page: true,
      serviceCategory: true,
      createdAt: true,
    },
    take: 100, // Limit for performance
  });

  const submissions: SubmissionRow[] = rawSubmissions.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    company: s.company,
    message: s.message,
    formType: s.formType,
    page: s.page,
    serviceCategory: s.serviceCategory,
    createdAt: s.createdAt,
  }));

  const totalCount = await prisma.formSubmission.count();

  return (
    <PageContainer>
      <PageHeader
        title="Formulärinlämningar"
        description={`${totalCount} inlämningar totalt`}
      />
      {submissions.length === 0 && !search && !formType ? (
        <EmptyState
          icon={<Inbox className="h-12 w-12" />}
          title="Inga inlämningar ännu"
          description="Formulärinlämningar från webbplatsen visas här."
        />
      ) : (
        <SubmissionsList submissions={submissions} />
      )}
    </PageContainer>
  );
}
