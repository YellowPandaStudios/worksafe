import { TestimonialsBlock } from '@/types/blocks';

interface TestimonialsProps {
  block: TestimonialsBlock;
}

export function Testimonials({ block }: TestimonialsProps) {
  const { title, subtitle, testimonialIds, layout } = block;

  return (
    <div>
      {title && (
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
      )}
      {subtitle && (
        <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>
      )}
      <div className={layout === 'carousel' ? 'carousel' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
        {/* Testimonials would be fetched and rendered here */}
        <div className="text-sm text-muted-foreground">
          Testimonial IDs: {testimonialIds.join(', ')}
        </div>
      </div>
    </div>
  );
}
