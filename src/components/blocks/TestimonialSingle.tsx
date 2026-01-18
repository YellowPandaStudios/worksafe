import { TestimonialSingleBlock } from '@/types/blocks';

interface TestimonialSingleProps {
  block: TestimonialSingleBlock;
}

export function TestimonialSingle({ block }: TestimonialSingleProps) {
  const { testimonialId, style } = block;

  return (
    <div>
      {/* Testimonial would be fetched and rendered here */}
      <div className="text-sm text-muted-foreground">
        Testimonial ID: {testimonialId} • Style: {style}
      </div>
    </div>
  );
}
