"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ContentBlock, BlockType } from "@/types/blocks";
import { createBlock, duplicateBlock } from "@/lib/blocks";
import { BlockWrapper } from "./BlockWrapper";
import { BlockPicker } from "./BlockPicker";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  allowedTypes?: BlockType[];
}

export function BlockEditor({
  blocks,
  onChange,
  allowedTypes,
}: BlockEditorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      onChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const handleAddBlock = (type: BlockType) => {
    const newBlock = createBlock(type);
    if (insertIndex !== null) {
      const newBlocks = [...blocks];
      newBlocks.splice(insertIndex, 0, newBlock);
      onChange(newBlocks);
    } else {
      onChange([...blocks, newBlock]);
    }
    setIsPickerOpen(false);
    setInsertIndex(null);
  };

  const handleUpdateBlock = (id: string, data: Partial<ContentBlock>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...data } : b)) as ContentBlock[]);
  };

  const handleDuplicateBlock = (id: string) => {
    const index = blocks.findIndex((b) => b.id === id);
    const block = blocks[index];
    if (block) {
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, duplicateBlock(block));
      onChange(newBlocks);
    }
  };

  const handleDeleteBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
  };

  const handleInsertAt = (index: number) => {
    setInsertIndex(index);
    setIsPickerOpen(true);
  };

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {blocks.map((block, index) => (
            <div key={block.id}>
              {/* Insert button between blocks */}
              <div className="flex justify-center py-1 opacity-0 hover:opacity-100 transition-opacity group">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="h-6 text-xs text-muted-foreground"
                  onClick={() => handleInsertAt(index)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Infoga block
                </Button>
              </div>

              <BlockWrapper
                block={block}
                onUpdate={(data) => handleUpdateBlock(block.id, data)}
                onDuplicate={() => handleDuplicateBlock(block.id)}
                onDelete={() => handleDeleteBlock(block.id)}
              />
            </div>
          ))}
        </SortableContext>
      </DndContext>

      {/* Add block button at end */}
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            setInsertIndex(null);
            setIsPickerOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Lägg till block
        </Button>
      </div>

      <BlockPicker
        open={isPickerOpen}
        onClose={() => {
          setIsPickerOpen(false);
          setInsertIndex(null);
        }}
        onSelect={handleAddBlock}
        allowedTypes={allowedTypes}
      />
    </div>
  );
}
