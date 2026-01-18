'use client';

import { useCallback } from 'react';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface RepeatableFieldListProps<T> {
  /** Array of items */
  items: T[];
  /** Called when items change */
  onChange: (items: T[]) => void;
  /** Render function for each item */
  renderItem: (item: T, index: number, handlers: ItemHandlers<T>) => React.ReactNode;
  /** Function to create a new empty item */
  createItem: () => T;
  /** Maximum number of items */
  maxItems?: number;
  /** Minimum number of items */
  minItems?: number;
  /** Label for add button */
  addLabel?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Allow reordering */
  reorderable?: boolean;
  /** Additional className */
  className?: string;
  /** Item wrapper className */
  itemClassName?: string;
}

export interface ItemHandlers<T> {
  /** Update the current item */
  update: (data: Partial<T>) => void;
  /** Remove the current item */
  remove: () => void;
  /** Move item up */
  moveUp: () => void;
  /** Move item down */
  moveDown: () => void;
  /** Whether this is the first item */
  isFirst: boolean;
  /** Whether this is the last item */
  isLast: boolean;
  /** Item index */
  index: number;
}

/**
 * Reusable component for managing arrays of items in forms.
 * Used for FAQ items, sidebar items, features, etc.
 */
export function RepeatableFieldList<T extends Record<string, unknown>>({
  items,
  onChange,
  renderItem,
  createItem,
  maxItems,
  minItems = 0,
  addLabel = 'Lägg till',
  emptyMessage = 'Inga poster tillagda',
  reorderable = true,
  className,
  itemClassName,
}: RepeatableFieldListProps<T>): React.ReactElement {
  const canAdd = !maxItems || items.length < maxItems;
  const canRemove = items.length > minItems;

  const handleAdd = useCallback(() => {
    if (canAdd) {
      onChange([...items, createItem()]);
    }
  }, [canAdd, items, onChange, createItem]);

  const handleRemove = useCallback(
    (index: number) => {
      if (canRemove) {
        onChange(items.filter((_, i) => i !== index));
      }
    },
    [canRemove, items, onChange]
  );

  const handleUpdate = useCallback(
    (index: number, data: Partial<T>) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], ...data };
      onChange(newItems);
    },
    [items, onChange]
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      onChange(newItems);
    },
    [items, onChange]
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index === items.length - 1) return;
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      onChange(newItems);
    },
    [items, onChange]
  );

  return (
    <div className={cn('space-y-3', className)}>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
          {emptyMessage}
        </div>
      ) : (
        items.map((item, index) => {
          const handlers: ItemHandlers<T> = {
            update: (data) => handleUpdate(index, data),
            remove: () => handleRemove(index),
            moveUp: () => handleMoveUp(index),
            moveDown: () => handleMoveDown(index),
            isFirst: index === 0,
            isLast: index === items.length - 1,
            index,
          };

          return (
            <div
              key={index}
              className={cn(
                'relative p-4 border rounded-lg bg-card',
                itemClassName
              )}
            >
              <div className="flex gap-3">
                {reorderable && items.length > 1 && (
                  <div className="flex flex-col gap-0.5 -ml-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handlers.moveUp}
                      disabled={handlers.isFirst}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handlers.moveDown}
                      disabled={handlers.isLast}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="flex-1">{renderItem(item, index, handlers)}</div>
                {canRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                    onClick={handlers.remove}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })
      )}

      {canAdd && (
        <Button type="button" variant="outline" onClick={handleAdd} className="w-full">
          <Plus className="h-4 w-4 mr-1" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Simplified item card wrapper for RepeatableFieldList.
 */
export interface RepeatableItemCardProps {
  /** Item number label */
  number?: number;
  /** Item title */
  title?: string;
  /** Card content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

export function RepeatableItemCard({
  number,
  title,
  children,
  className,
}: RepeatableItemCardProps): React.ReactElement {
  return (
    <div className={cn('space-y-3', className)}>
      {(number !== undefined || title) && (
        <div className="text-sm font-medium text-muted-foreground">
          {number !== undefined && `#${number + 1}`}
          {number !== undefined && title && ' - '}
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
