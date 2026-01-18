"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ContentBlock } from "@/types/blocks";
import { getBlockDefinition } from "@/lib/blocks";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  GripVertical,
  Settings,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { BlockSettings } from "./BlockSettings";
import { getBlockEditor } from "./blocks";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import * as LucideIcons from "lucide-react";

interface BlockWrapperProps {
  block: ContentBlock;
  onUpdate: (data: Partial<ContentBlock>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function BlockWrapper({
  block,
  onUpdate,
  onDuplicate,
  onDelete,
}: BlockWrapperProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  // Check if this block type uses tabs (pilot: only hero)
  const usesTabs = block.type === "hero";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const definition = getBlockDefinition(block.type);
  const BlockEditorComponent = getBlockEditor(block.type);

  // Get icon component
  const IconComponent = definition?.icon
    ? (LucideIcons as any)[definition.icon]
    : LucideIcons.Box;

  const isCollapsed = !isExpanded && !showSettings;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg bg-card shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div
        className={`flex items-center gap-2 p-3 border-b bg-muted rounded-t-lg ${
          isCollapsed ? "rounded-b-lg border-b-0" : ""
        }`}
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab hover:bg-accent p-1 rounded active:cursor-grabbing shrink-0"
          type="button"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 flex-1 text-left hover:bg-accent/50 rounded px-2 py-1 -mx-2 transition-colors cursor-pointer"
        >
          <IconComponent className="h-4 w-4 text-muted-foreground shrink-0" />

          <span className="font-medium text-sm">
            {definition?.labelSv || block.type}
          </span>

          <div className="ml-auto shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(!showSettings);
            }}
            title="Inställningar"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            title="Duplicera"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteDialogOpen(true);
            }}
            title="Ta bort"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Settings panel - separate from tabs */}
      {showSettings && (
        <div
          className={`p-4 border-b bg-muted ${
            !isExpanded ? "rounded-b-lg border-b-0" : ""
          }`}
        >
          <BlockSettings
            settings={{
              background: block.background,
              paddingTop: block.paddingTop,
              paddingBottom: block.paddingBottom,
              maxWidth: block.maxWidth,
              anchor: block.anchor,
            }}
            onChange={onUpdate}
          />
        </div>
      )}

      {/* Content with Tabs (Hero only) */}
      {isExpanded && BlockEditorComponent && usesTabs && (
        <div className="p-4 rounded-b-lg">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Innehåll</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="actions">Åtgärder</TabsTrigger>
              <TabsTrigger value="styling">Styling</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="mt-4">
              <BlockEditorComponent
                block={block}
                onChange={onUpdate}
                tab="content"
              />
            </TabsContent>
            <TabsContent value="media" className="mt-4">
              <BlockEditorComponent
                block={block}
                onChange={onUpdate}
                tab="media"
              />
            </TabsContent>
            <TabsContent value="actions" className="mt-4">
              <BlockEditorComponent
                block={block}
                onChange={onUpdate}
                tab="actions"
              />
            </TabsContent>
            <TabsContent value="styling" className="mt-4">
              <BlockEditorComponent
                block={block}
                onChange={onUpdate}
                tab="styling"
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Content without Tabs (other blocks) */}
      {isExpanded && BlockEditorComponent && !usesTabs && (
        <div className="p-4 rounded-b-lg">
          <BlockEditorComponent block={block} onChange={onUpdate} />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort block</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill ta bort detta block? Detta går inte att
              ångra.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
