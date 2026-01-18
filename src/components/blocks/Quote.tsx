'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { QuoteBlock } from '@/types/blocks';

interface QuoteProps {
  block: QuoteBlock;
}

export function Quote({ block }: QuoteProps): React.ReactElement {
  const { text, author, role, image } = block;

  return (
    <blockquote className="relative border-l-4 border-primary pl-6 py-4">
      <svg
        className="absolute -top-2 -left-3 h-8 w-8 text-primary/20"
        fill="currentColor"
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
      </svg>
      <p className="text-lg md:text-xl italic text-foreground leading-relaxed">
        {text}
      </p>
      {(author || role) && (
        <footer className="mt-4 flex items-center gap-3">
          {image && (
            <div className="relative h-10 w-10 rounded-full overflow-hidden">
              <Image
                src={image}
                alt={author || ''}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            {author && (
              <cite className="not-italic font-semibold text-foreground">
                {author}
              </cite>
            )}
            {role && (
              <p className="text-sm text-muted-foreground">{role}</p>
            )}
          </div>
        </footer>
      )}
    </blockquote>
  );
}
