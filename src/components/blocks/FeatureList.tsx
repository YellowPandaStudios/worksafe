'use client';

import { FeatureListBlock } from '@/types/blocks';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { JSONContent } from '@tiptap/react';

interface FeatureListProps {
  block: FeatureListBlock;
}

const COLUMN_CLASSES = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

function FeatureDescription({ 
  content, 
  icon: Icon, 
  title 
}: { 
  content: JSONContent | null; 
  icon: any; 
  title: string;
}) {
  // Editor for rendering description
  const descriptionEditor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: true,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      ImageExtension.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full' },
      }),
    ],
    content: content,
    immediatelyRender: false,
    editable: false,
  });

  return (
    <div className="flex gap-4">
      <div className="shrink-0">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        {content && descriptionEditor && (
          <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
            <EditorContent editor={descriptionEditor} />
          </div>
        )}
      </div>
    </div>
  );
}

export function FeatureList({ block }: FeatureListProps) {
  const { title, subtitle, columns, features } = block;

  // Handle description - support both old string format and new JSONContent format
  const getDescriptionContent = (desc: string | JSONContent | undefined): JSONContent | null => {
    if (!desc) return null;
    // If it's already JSONContent, return it
    if (typeof desc === 'object' && desc !== null) {
      return desc as JSONContent;
    }
    // If it's a string (old format), convert to JSONContent
    if (typeof desc === 'string') {
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: desc }],
          },
        ],
      };
    }
    return null;
  };

  return (
    <div>
      {title && (
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
      )}
      {subtitle && (
        <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>
      )}
      <div className={cn('grid gap-6', COLUMN_CLASSES[columns])}>
        {features.map((feature, index) => {
          const Icon = (LucideIcons as any)[feature.icon] || LucideIcons.Check;
          const descriptionContent = getDescriptionContent(feature.description);
          
          return (
            <FeatureDescription
              key={index}
              content={descriptionContent}
              icon={Icon}
              title={feature.title}
            />
          );
        })}
      </div>
    </div>
  );
}
