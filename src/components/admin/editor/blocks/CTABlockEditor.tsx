"use client";

import { CTABlock } from "@/types/blocks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LinkInput } from "../LinkInput";

interface CTABlockEditorProps {
  block: CTABlock;
  onChange: (data: Partial<CTABlock>) => void;
}

export function CTABlockEditor({ block, onChange }: CTABlockEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Rubrik</Label>
        <Input
          value={block.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Redo att komma igång?"
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
        <Label>CTA-knapp text</Label>
        <Input
          value={block.ctaText}
          onChange={(e) => onChange({ ctaText: e.target.value })}
          placeholder="Kontakta oss"
        />
      </div>
      <div className="space-y-2">
        <Label>CTA-knapp länk</Label>
        <LinkInput
          value={block.ctaLink}
          onChange={(value) => onChange({ ctaLink: value })}
          placeholder="/kontakt"
        />
      </div>

      <div className="space-y-2">
        <Label>Stil</Label>
        <Select
          value={block.style}
          onValueChange={(value) => onChange({ style: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primär</SelectItem>
            <SelectItem value="secondary">Sekundär</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
