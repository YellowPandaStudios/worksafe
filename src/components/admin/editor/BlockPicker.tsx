'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BlockType } from '@/types/blocks';
import { BLOCK_DEFINITIONS, BLOCK_CATEGORIES, BlockDefinition } from '@/lib/blocks';
import { Search, ChevronDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface BlockPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: BlockType) => void;
  allowedTypes?: BlockType[];
}

export function BlockPicker({ open, onClose, onSelect, allowedTypes }: BlockPickerProps) {
  const [search, setSearch] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // Get filtered blocks
  const filteredBlocks = BLOCK_DEFINITIONS.filter((block) => {
    // Filter by allowed types
    if (allowedTypes && !allowedTypes.includes(block.type)) return false;

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        block.label.toLowerCase().includes(searchLower) ||
        block.labelSv.toLowerCase().includes(searchLower) ||
        block.description.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Group blocks by category
  const blocksByCategory = BLOCK_CATEGORIES.map((cat) => ({
    ...cat,
    blocks: filteredBlocks.filter((block) => block.category === cat.id),
  })).filter((cat) => cat.blocks.length > 0);

  // Initialize all categories as collapsed when sheet opens
  useEffect(() => {
    if (open) {
      const initial: Record<string, boolean> = {};
      BLOCK_CATEGORIES.forEach((cat) => {
        initial[cat.id] = false;
      });
      setOpenCategories(initial);
    }
  }, [open]);

  const handleSelect = (type: BlockType) => {
    onSelect(type);
    setSearch('');
    // Collapse all categories
    const collapsed: Record<string, boolean> = {};
    BLOCK_CATEGORIES.forEach((cat) => {
      collapsed[cat.id] = false;
    });
    setOpenCategories(collapsed);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[400px] sm:max-w-[400px] p-0 flex flex-col">
        <SheetHeader className="p-4 pb-0">
          <SheetTitle>Lägg till block</SheetTitle>
        </SheetHeader>

        {/* Search */}
        <div className="relative px-4 py-3">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sök block..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Block list with collapsible categories */}
        <ScrollArea className="flex-1">
          <div className="px-2 pb-4">
            {search ? (
              // When searching, show flat list
              <div className="space-y-0.5">
                {filteredBlocks.map((block) => (
                  <BlockPickerItem
                    key={block.type}
                    block={block}
                    onClick={() => handleSelect(block.type)}
                  />
                ))}
                {filteredBlocks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Inga block hittades
                  </div>
                )}
              </div>
            ) : (
              // When not searching, show collapsible categories
              <div className="space-y-1">
                {blocksByCategory.map((category) => {
                  const CategoryIcon = (LucideIcons as any)[category.icon];
                  const isOpen = openCategories[category.id] ?? false;
                  return (
                    <Collapsible
                      key={category.id}
                      open={isOpen}
                      onOpenChange={(open) =>
                        setOpenCategories((prev) => ({ ...prev, [category.id]: open }))
                      }
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 rounded-md hover:bg-accent text-left group">
                        <span className="flex items-center gap-2">
                          {CategoryIcon && (
                            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium text-sm">{category.label}</span>
                          <span className="text-xs text-muted-foreground">
                            ({category.blocks.length})
                          </span>
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-0.5 ml-2">
                          {category.blocks.map((block) => (
                            <BlockPickerItem
                              key={block.type}
                              block={block}
                              onClick={() => handleSelect(block.type)}
                            />
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function BlockPickerItem({
  block,
  onClick,
}: {
  block: BlockDefinition;
  onClick: () => void;
}) {
  const Icon = (LucideIcons as any)[block.icon] || LucideIcons.Box;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent w-full text-left transition-colors"
    >
      <div className="p-1.5 rounded-md bg-muted shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{block.labelSv}</div>
        <div className="text-xs text-muted-foreground truncate">{block.description}</div>
      </div>
    </button>
  );
}
