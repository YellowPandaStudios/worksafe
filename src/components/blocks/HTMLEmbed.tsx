import { HTMLEmbedBlock } from '@/types/blocks';

interface HTMLEmbedProps {
  block: HTMLEmbedBlock;
}

export function HTMLEmbed({ block }: HTMLEmbedProps) {
  const { code, sandboxed } = block;

  if (sandboxed) {
    return (
      <div className="prose prose-sm max-w-none">
        <div
          dangerouslySetInnerHTML={{ __html: code }}
          className="html-embed-sandboxed"
        />
      </div>
    );
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: code }}
      className="html-embed"
    />
  );
}
