import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { PageHeader, PageContainer, EmptyState } from '@/components/admin/common';
import { TestimonialsList, type TestimonialRow } from './TestimonialsList';

interface TestimonialsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TestimonialsPage({ searchParams }: TestimonialsPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const search = (params.search as string) || '';
  const category = (params.category as string) || '';
  const status = (params.status as string) || '';
  const sortBy = (params.sortBy as string) || null;
  const sortDir = (params.sortDir as 'asc' | 'desc') || null;

  // Build where clause
  const where: Prisma.TestimonialWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
      { quote: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category && category !== 'all') {
    where.serviceCategory = category as Prisma.TestimonialWhereInput['serviceCategory'];
  }

  if (status === 'active') {
    where.isActive = true;
  } else if (status === 'inactive') {
    where.isActive = false;
  }

  // Build orderBy clause
  const orderBy =
    sortBy && sortDir
      ? { [sortBy]: sortDir }
      : { sortOrder: 'asc' as const };

  const rawTestimonials = await prisma.testimonial.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy,
    select: {
      id: true,
      quote: true,
      name: true,
      role: true,
      company: true,
      image: true,
      serviceCategory: true,
      sortOrder: true,
      isActive: true,
      updatedAt: true,
    },
  });

  const testimonials: TestimonialRow[] = rawTestimonials.map((t) => ({
    id: t.id,
    quote: t.quote,
    name: t.name,
    role: t.role,
    company: t.company,
    image: t.image,
    serviceCategory: t.serviceCategory,
    sortOrder: t.sortOrder,
    isActive: t.isActive,
    updatedAt: t.updatedAt,
  }));

  return (
    <PageContainer>
      <PageHeader
        title="Omdömen"
        description="Hantera kundomdömen och recensioner"
        actions={
          <Button asChild>
            <Link href="/admin/testimonials/new">
              <Plus className="h-4 w-4 mr-2" />
              Nytt omdöme
            </Link>
          </Button>
        }
      />
      {testimonials.length === 0 && !search && !category && !status ? (
        <EmptyState
          title="Inga omdömen ännu"
          description="Lägg till kundomdömen för att visa på webbplatsen."
          action={{
            label: 'Lägg till omdöme',
            href: '/admin/testimonials/new',
          }}
        />
      ) : (
        <TestimonialsList testimonials={testimonials} />
      )}
    </PageContainer>
  );
}
