"use client";

import { CTAWithImageBlock } from "@/types/blocks";
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
import { LinkInput } from "../LinkInput";

interface CTAWithImageBlockEditorProps {
  block: CTAWithImageBlock;
  onChange: (data: Partial<CTAWithImageBlock>) => void;
}

export function CTAWithImageBlockEditor({
  block,
  onChange,
}: CTAWithImageBlockEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Rubrik</Label>
        <Input
          value={block.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Rubrik"
        />
      </div>

      <div className="space-y-2">
        <Label>Underrubrik</Label>
        <Input
          value={block.subtitle || ""}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="Valfri underrubrik"
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
          value={block.ctaText}
          onChange={(e) => onChange({ ctaText: e.target.value })}
          placeholder="Läs mer"
        />
      </div>
      <div className="space-y-2">
        <Label>CTA-knapp länk</Label>
        <LinkInput
          value={block.ctaLink}
          onChange={(value) => onChange({ ctaLink: value })}
          placeholder="/tjanster"
        />
      </div>
    </div>
  );
}
