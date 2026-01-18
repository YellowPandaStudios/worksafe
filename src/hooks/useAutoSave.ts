import { useEffect, useRef } from 'react';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  enabled?: boolean;
  interval?: number; // milliseconds
}

/**
 * Auto-save hook that debounces save requests
 * Only saves when enabled and data has changed
 */
export function useAutoSave<T>({
  data,
  onSave,
  enabled = true,
  interval = 2000, // 2 seconds default
}: UseAutoSaveOptions<T>): void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      // Only save if data has actually changed
      if (JSON.stringify(data) !== JSON.stringify(lastSavedRef.current)) {
        try {
          await onSave(data);
          lastSavedRef.current = data;
        } catch (error) {
          // Silently fail - auto-save errors shouldn't interrupt user
          console.error('Auto-save failed:', error);
        }
      }
    }, interval);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, enabled, interval]);
}
