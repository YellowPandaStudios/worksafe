'use client';

import { useState } from 'react';
import { FAQBlock } from '@/types/blocks';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQProps {
  block: FAQBlock;
}

export function FAQ({ block }: FAQProps) {
  const { title, subtitle, items } = block;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {(title || subtitle) && (
        <div className="block-header">
          {title && <h2 className="block-title">{title}</h2>}
          {subtitle && <p className="block-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="block-card">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between text-left hover:bg-accent transition-colors -m-6 p-6"
            >
              <span className="block-feature-title">{item.question}</span>
              <ChevronDown
                className={cn(
                  'icon-md icon-muted transition-transform flex-shrink-0 ml-4',
                  openIndex === index && 'transform rotate-180'
                )}
              />
            </button>
            {openIndex === index && (
              <div className="text-body-sm text-text-secondary mt-4">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
