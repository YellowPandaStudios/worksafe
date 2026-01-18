"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlockSettings as BlockSettingsType, BlockType } from "@/types/blocks";

interface BlockSettingsProps {
  settings: BlockSettingsType;
  onChange: (settings: Partial<BlockSettingsType>) => void;
  blockType?: BlockType;
}

export function BlockSettings({ settings, onChange }: BlockSettingsProps) {
  return (
    <div className="grid grid-cols-[auto_auto_auto_auto_1fr] grid-rows-[auto_auto] gap-x-2.5 gap-y-1.5 items-center">
      {/* Row 1: Labels */}
      <Label className="text-xs text-muted-foreground leading-none">
        Bakgrund
      </Label>
      <Label className="text-xs text-muted-foreground leading-none">
        Padding topp
      </Label>
      <Label className="text-xs text-muted-foreground leading-none">
        Padding botten
      </Label>
      <Label className="text-xs text-muted-foreground leading-none">
        Max bredd
      </Label>
      <Label className="text-xs text-muted-foreground leading-none">
        Ankare (ID)
      </Label>

      {/* Row 2: Controls */}
      <Select
        value={settings.background || "white"}
        onValueChange={(value) => onChange({ background: value as any })}
      >
        <SelectTrigger className="h-9 w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="white">Vit</SelectItem>
          <SelectItem value="gray">Grå</SelectItem>
          <SelectItem value="primary">Primär</SelectItem>
          <SelectItem value="dark">Mörk</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={settings.paddingTop || "md"}
        onValueChange={(value) => onChange({ paddingTop: value as any })}
      >
        <SelectTrigger className="h-9 w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Ingen</SelectItem>
          <SelectItem value="sm">Liten</SelectItem>
          <SelectItem value="md">Medium</SelectItem>
          <SelectItem value="lg">Stor</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={settings.paddingBottom || "md"}
        onValueChange={(value) => onChange({ paddingBottom: value as any })}
      >
        <SelectTrigger className="h-9 w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Ingen</SelectItem>
          <SelectItem value="sm">Liten</SelectItem>
          <SelectItem value="md">Medium</SelectItem>
          <SelectItem value="lg">Stor</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={settings.maxWidth || "xl"}
        onValueChange={(value) => onChange({ maxWidth: value as any })}
      >
        <SelectTrigger className="h-9 w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="xl">Extra stor</SelectItem>
          <SelectItem value="full">Full bredd</SelectItem>
        </SelectContent>
      </Select>

      <Input
        value={settings.anchor || ""}
        onChange={(e) => onChange({ anchor: e.target.value })}
        placeholder="t.ex. kontakt"
        className="h-9 w-full"
      />
    </div>
  );
}
