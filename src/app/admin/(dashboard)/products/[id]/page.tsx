import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageHeader, PageContainer } from '@/components/admin/common';
import { ProductForm } from '@/components/admin/forms/ProductForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return (
    <PageContainer variant="narrow">
      <PageHeader
        title={`Redigera: ${product.name}`}
        backLink={{ href: '/admin/products', label: 'Tillbaka' }}
      />
      <ProductForm
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: null, // Product uses old enum, will be updated to use Category model
          sku: product.sku,
          image: product.image,
          imageAlt: product.imageAlt,
          gallery: product.gallery,
          specifications: product.specifications,
          price: product.price ? Number(product.price) : null,
          comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
          costPrice: product.costPrice ? Number(product.costPrice) : null,
          vatRate: Number(product.vatRate),
          vatIncluded: product.vatIncluded,
          b2bPrice: product.b2bPrice ? Number(product.b2bPrice) : null,
          b2bMinQuantity: product.b2bMinQuantity,
          trackStock: product.trackStock,
          stockQuantity: product.stockQuantity,
          lowStockThreshold: product.lowStockThreshold,
          allowBackorder: product.allowBackorder,
          backorderLeadDays: product.backorderLeadDays,
          minQuantity: product.minQuantity,
          maxQuantity: product.maxQuantity,
          quantityStep: product.quantityStep,
          shortDescription: product.shortDescription,
          contentBlocks: product.contentBlocks,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          ogImage: product.ogImage,
          canonicalUrl: product.canonicalUrl,
          status: product.status,
          publishedAt: product.publishedAt?.toISOString() || null,
          sortOrder: product.sortOrder,
          featured: product.featured,
          newArrival: product.newArrival,
          newArrivalUntil: product.newArrivalUntil?.toISOString() || null,
        }}
      />
    </PageContainer>
  );
}
