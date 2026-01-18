import Link from 'next/link';
import { ComparisonBlock } from '@/types/blocks';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonProps {
  block: ComparisonBlock;
}

export function Comparison({ block }: ComparisonProps) {
  const { title, items } = block;

  // Get all unique features across all items
  const allFeatures = Array.from(
    new Set(items.flatMap((item) => item.features))
  );

  return (
    <div>
      {title && (
        <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              'border rounded-lg p-6',
              item.highlighted && 'border-primary ring-2 ring-primary/20'
            )}
          >
            <h3 className="text-xl font-bold mb-2">{item.name}</h3>
            {item.price && (
              <div className="text-3xl font-bold mb-4">{item.price}</div>
            )}
            <ul className="space-y-2 mb-6">
              {allFeatures.map((feature, featureIndex) => {
                const hasFeature = item.features.includes(feature);
                return (
                  <li key={featureIndex} className="flex items-center gap-2">
                    {hasFeature ? (
                      <Check className="h-5 w-5 text-success" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className={cn(!hasFeature && 'text-muted-foreground')}>
                      {feature}
                    </span>
                  </li>
                );
              })}
            </ul>
            {item.ctaText && item.ctaLink && (
              <Button asChild className="w-full" variant={item.highlighted ? 'default' : 'outline'}>
                <Link href={item.ctaLink}>{item.ctaText}</Link>
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
