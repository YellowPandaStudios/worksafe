import { ProductCardsBlock } from '@/types/blocks';
import { cn } from '@/lib/utils';

interface ProductCardsProps {
  block: ProductCardsBlock;
}

const COLUMN_CLASSES = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

export function ProductCards({ block }: ProductCardsProps) {
  const { title, subtitle, productIds, categoryId, columns, showPrice } = block;

  return (
    <div>
      {title && (
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
      )}
      {subtitle && (
        <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>
      )}
      <div className={cn('grid gap-6', COLUMN_CLASSES[columns])}>
        {/* Products would be fetched and rendered here */}
        <div className="text-sm text-muted-foreground">
          {productIds ? `Product IDs: ${productIds.join(', ')}` : 'All products'}
          {categoryId && ` • Category ID: ${categoryId}`}
          {showPrice && ' • Show price'}
        </div>
      </div>
    </div>
  );
}
