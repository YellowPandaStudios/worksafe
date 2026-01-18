'use client';

import { VideoEmbedBlock } from '@/types/blocks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImagePicker } from '../../media/ImagePicker';

interface VideoEmbedBlockEditorProps {
  block: VideoEmbedBlock;
  onChange: (data: Partial<VideoEmbedBlock>) => void;
}

export function VideoEmbedBlockEditor({ block, onChange }: VideoEmbedBlockEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Rubrik</Label>
        <Input
          value={block.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Valfri rubrik"
        />
      </div>

      <div className="space-y-2">
        <Label>Underrubrik</Label>
        <Input
          value={block.subtitle || ''}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="Valfri underrubrik"
        />
      </div>

      <div className="space-y-2">
        <Label>Video URL (YouTube eller Vimeo)</Label>
        <Input
          value={block.videoUrl}
          onChange={(e) => onChange({ videoUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>

      <div className="space-y-2">
        <Label>Miniatyrbild (valfritt)</Label>
        <ImagePicker
          value={block.thumbnail}
          onChange={(url) => onChange({ thumbnail: url || undefined })}
        />
        {block.thumbnail && (
          <Input
            value={block.thumbnailAlt || ''}
            onChange={(e) => onChange({ thumbnailAlt: e.target.value })}
            placeholder="Alt-text för miniatyrbild"
            className="mt-2"
          />
        )}
      </div>
    </div>
  );
}
