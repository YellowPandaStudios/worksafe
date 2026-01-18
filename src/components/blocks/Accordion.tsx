'use client';

import { useState } from 'react';
import { AccordionBlock } from '@/types/blocks';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionProps {
  block: AccordionBlock;
}

export function Accordion({ block }: AccordionProps) {
  const { title, items } = block;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {title && (
        <h2 className="text-3xl font-bold mb-8">{title}</h2>
      )}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="border rounded-lg">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-accent transition-colors"
            >
              <span className="font-semibold">{item.title}</span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 text-muted-foreground transition-transform',
                  openIndex === index && 'transform rotate-180'
                )}
              />
            </button>
            {openIndex === index && (
              <div className="p-4 pt-0 text-muted-foreground whitespace-pre-line">
                {item.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
