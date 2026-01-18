import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PostForm } from '@/components/admin/forms/PostForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <PostForm
      initialData={{
        ...post,
        tagIds: post.tags.map((t) => t.tagId),
        publishedAt: post.publishedAt?.toISOString() || null,
        scheduledFor: post.scheduledFor?.toISOString() || null,
      }}
    />
  );
}
