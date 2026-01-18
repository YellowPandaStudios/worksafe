'use client';

import { TimelineBlock } from '@/types/blocks';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { JSONContent } from '@tiptap/react';

interface TimelineProps {
  block: TimelineBlock;
}

export function Timeline({ block }: TimelineProps) {
  const { title, items } = block;

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
        <div className="block-header">
          <h2 className="block-title">{title}</h2>
        </div>
      )}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
        <div className="stack-lg">
          {items.map((item, index) => {
            const descriptionContent = getDescriptionContent(item.description);
            return (
              <div key={index} className="relative pl-20">
                <div className="absolute left-6 top-2 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                <div className="text-overline mb-1">
                  {item.date}
                </div>
                <h3 className="text-heading-xs mb-2">{item.title}</h3>
                {descriptionContent && (
                  <TimelineDescription content={descriptionContent} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TimelineDescription({ content }: { content: JSONContent }) {
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

  if (!descriptionEditor) return null;

  return (
    <div className="text-muted-foreground prose prose-sm max-w-none">
      <EditorContent editor={descriptionEditor} />
    </div>
  );
}
