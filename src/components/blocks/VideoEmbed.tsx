'use client';

import Image from 'next/image';
import { VideoEmbedBlock } from '@/types/blocks';
import { useState } from 'react';
import { Play } from 'lucide-react';

interface VideoEmbedProps {
  block: VideoEmbedBlock;
}

function getVideoEmbedUrl(url: string): string | null {
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}

export function VideoEmbed({ block }: VideoEmbedProps) {
  const { title, subtitle, videoUrl, thumbnail, thumbnailAlt } = block;
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = videoUrl ? getVideoEmbedUrl(videoUrl) : null;

  return (
    <div>
      {title && (
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
      )}
      {subtitle && (
        <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>
      )}
      <div className="relative aspect-video rounded-lg overflow-hidden">
        {!isPlaying && embedUrl ? (
          <>
            {thumbnail && (
              <Image
                src={thumbnail}
                alt={thumbnailAlt || ''}
                fill
                className="object-cover"
              />
            )}
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-foreground/30 hover:bg-foreground/40 transition-colors"
            >
              <Play className="h-16 w-16 text-background" />
            </button>
          </>
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">Invalid video URL</p>
          </div>
        )}
      </div>
    </div>
  );
}
