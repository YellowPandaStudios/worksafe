'use client';

import { BlockEditor } from './editor/BlockEditor';
import { SIMPLIFIED_BLOCK_TYPES } from '@/types/blocks';
import type { ContentBlock } from '@/types/blocks';

interface SimplifiedBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

/**
 * SimplifiedBlockEditor - A restricted block editor for Services & Blog posts.
 * 
 * Limits available block types to:
 * - richText: TipTap content with formatting
 * - singleImage: Single image with caption
 * - videoEmbed: YouTube/Vimeo embed
 * - divider: Horizontal separator
 * - tabs: Tabbed content sections
 * - simpleTable: Basic data table
 * - inlineCTA: Call-to-action button
 * - quote: Blockquote with attribution
 */
export function SimplifiedBlockEditor({
  blocks,
  onChange,
}: SimplifiedBlockEditorProps): React.ReactElement {
  return (
    <BlockEditor
      blocks={blocks}
      onChange={onChange}
      allowedTypes={SIMPLIFIED_BLOCK_TYPES}
    />
  );
}
