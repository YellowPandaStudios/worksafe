"use client";

import { TextImageBlock } from "@/types/blocks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePicker } from "../../media/ImagePicker";
import { RichTextEditor } from "../RichTextEditor";
import { LinkInput } from "../LinkInput";

interface TextImageBlockEditorProps {
  block: TextImageBlock;
  onChange: (data: Partial<TextImageBlock>) => void;
}

export function TextImageBlockEditor({
  block,
  onChange,
}: TextImageBlockEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Rubrik</Label>
        <Input
          value={block.title || ""}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Valfri rubrik"
        />
      </div>

      <div className="space-y-2">
        <Label>Text</Label>
        <textarea
          value={block.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Skriv text här..."
          className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
        />
      </div>

      <div className="space-y-2">
        <Label>Bild</Label>
        <ImagePicker
          value={block.image}
          onChange={(url) => onChange({ image: url || "" })}
        />
        {block.image && (
          <Input
            value={block.imageAlt || ""}
            onChange={(e) => onChange({ imageAlt: e.target.value })}
            placeholder="Alt-text för bilden"
            className="mt-2"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>Bildposition</Label>
        <Select
          value={block.imagePosition}
          onValueChange={(value) => onChange({ imagePosition: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Vänster</SelectItem>
            <SelectItem value="right">Höger</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>CTA-knapp text</Label>
        <Input
          value={block.ctaText || ""}
          onChange={(e) => onChange({ ctaText: e.target.value })}
          placeholder="Läs mer"
        />
      </div>
      <div className="space-y-2">
        <Label>CTA-knapp länk</Label>
        <LinkInput
          value={block.ctaLink || ""}
          onChange={(value) => onChange({ ctaLink: value })}
          placeholder="/tjanster"
        />
      </div>
    </div>
  );
}
