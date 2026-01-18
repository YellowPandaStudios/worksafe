'use client';

import { useState, useCallback } from 'react';
import type { Media } from '@prisma/client';
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/r2';

interface UploadResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

interface ConfirmResponse {
  success: boolean;
  media: Media;
}

interface UseMediaUploadOptions {
  onSuccess?: (media: Media) => void;
  onError?: (error: string) => void;
  categoryId?: string;
}

interface UseMediaUploadReturn {
  upload: (file: File, folder?: string) => Promise<Media | null>;
  progress: number;
  isUploading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Hook for handling media uploads to R2 with progress tracking
 */
export function useMediaUpload(
  options: UseMediaUploadOptions = {}
): UseMediaUploadReturn {
  const { onSuccess, onError, categoryId } = options;

  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
    setError(null);
  }, []);

  const upload = useCallback(
    async (file: File, folder: string = 'uploads'): Promise<Media | null> => {
      // Reset state
      setProgress(0);
      setError(null);
      setIsUploading(true);

      try {
        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
          throw new Error(
            `Filtypen stöds inte. Tillåtna typer: ${ALLOWED_IMAGE_TYPES.join(', ')}`
          );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
          throw new Error(`Filen är för stor. Max storlek: ${maxSizeMB}MB`);
        }

        // Step 1: Get presigned upload URL
        setProgress(5);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            size: file.size,
            folder,
          }),
        });

        if (!uploadResponse.ok) {
          const data = await uploadResponse.json();
          throw new Error(data.error || 'Kunde inte få uppladdnings-URL');
        }

        const { uploadUrl, key, publicUrl } = (await uploadResponse.json()) as UploadResponse;
        setProgress(10);

        // Step 2: Upload directly to R2 using XHR for progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              // Progress from 10% to 80%
              const uploadProgress = (event.loaded / event.total) * 70;
              setProgress(10 + uploadProgress);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Uppladdning misslyckades med status ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Nätverksfel vid uppladdning'));
          });

          xhr.addEventListener('abort', () => {
            reject(new Error('Uppladdningen avbröts'));
          });

          xhr.open('PUT', uploadUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
        });

        setProgress(85);

        // Step 3: Confirm upload and save to database
        // Get image dimensions if it's an image
        let width: number | undefined;
        let height: number | undefined;

        if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
          try {
            const dimensions = await getImageDimensions(file);
            width = dimensions.width;
            height = dimensions.height;
          } catch {
            // Ignore dimension errors, they're optional
          }
        }

        const confirmResponse = await fetch('/api/upload/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key,
            url: publicUrl,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
            width,
            height,
            folder,
            categoryId: categoryId || null,
          }),
        });

        if (!confirmResponse.ok) {
          const data = await confirmResponse.json();
          throw new Error(data.error || 'Kunde inte bekräfta uppladdningen');
        }

        const { media } = (await confirmResponse.json()) as ConfirmResponse;
        setProgress(100);
        setIsUploading(false);

        onSuccess?.(media);
        return media;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ett fel uppstod';
        setError(errorMessage);
        setIsUploading(false);
        onError?.(errorMessage);
        return null;
      }
    },
    [onSuccess, onError, categoryId]
  );

  return {
    upload,
    progress,
    isUploading,
    error,
    reset,
  };
}

/**
 * Get dimensions of an image file
 */
function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };

    img.src = url;
  });
}
