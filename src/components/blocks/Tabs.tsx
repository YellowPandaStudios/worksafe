'use client';

import { useState } from 'react';
import { TabsBlock } from '@/types/blocks';
import { cn } from '@/lib/utils';

interface TabsProps {
  block: TabsBlock;
}

export function Tabs({ block }: TabsProps) {
  const { title, tabs } = block;
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      {title && (
        <h2 className="text-3xl font-bold mb-8">{title}</h2>
      )}
      <div>
        <div className="flex border-b mb-4">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={cn(
                'px-6 py-3 font-medium border-b-2 transition-colors',
                activeTab === index
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-line">{tabs[activeTab]?.content}</p>
        </div>
      </div>
    </div>
  );
}
