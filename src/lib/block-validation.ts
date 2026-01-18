import { ContentBlock } from '@/types/blocks';
import { Prisma } from '@prisma/client';

/**
 * Parse blocks from JSON (Prisma JSON type)
 * Handles empty arrays, null, and invalid data gracefully
 */
export function parseBlocks(data: unknown): ContentBlock[] {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    // Basic validation - ensure each item has id and type
    return data.filter((block): block is ContentBlock => {
      return (
        typeof block === 'object' &&
        block !== null &&
        'id' in block &&
        'type' in block &&
        typeof block.id === 'string' &&
        typeof block.type === 'string'
      );
    }) as ContentBlock[];
  }

  return [];
}

/**
 * Validate blocks array structure
 * Returns true if all blocks have required fields
 */
export function validateBlocks(blocks: ContentBlock[]): boolean {
  return blocks.every((block) => {
    return (
      typeof block.id === 'string' &&
      block.id.length > 0 &&
      typeof block.type === 'string' &&
      block.type.length > 0
    );
  });
}

/**
 * Transform blocks to JSON for Prisma
 * Ensures proper serialization
 */
export function blocksToJSON(blocks: ContentBlock[]): Prisma.InputJsonValue {
  return blocks as unknown as Prisma.InputJsonValue;
}
