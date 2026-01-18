'use client';

import Link from 'next/link';
import { FeatureCardsBlock } from '@/types/blocks';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { JSONContent } from '@tiptap/react';

interface FeatureCardsProps {
  block: FeatureCardsBlock;
}

export function FeatureCards({ block }: FeatureCardsProps) {
  const { title, subtitle, cards } = block;

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
      {(title || subtitle) && (
        <div className="block-header">
          {title && <h2 className="block-title">{title}</h2>}
          {subtitle && <p className="block-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="block-grid-3">
        {cards.map((card, index) => {
          const Icon = (LucideIcons as any)[card.icon] || LucideIcons.ArrowRight;
          const descriptionContent = getDescriptionContent(card.description);
          const content = (
            <div className={cn(
              card.link ? 'block-card-interactive' : 'block-card'
            )}>
              <Icon className="block-feature-icon" />
              <h3 className="block-feature-title">{card.title}</h3>
              {descriptionContent && (
                <CardDescription content={descriptionContent} />
              )}
            </div>
          );

          return card.link ? (
            <Link key={index} href={card.link}>
              {content}
            </Link>
          ) : (
            <div key={index}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}

function CardDescription({ content }: { content: JSONContent }) {
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
    <div className="block-feature-desc prose prose-sm max-w-none">
      <EditorContent editor={descriptionEditor} />
    </div>
  );
}
