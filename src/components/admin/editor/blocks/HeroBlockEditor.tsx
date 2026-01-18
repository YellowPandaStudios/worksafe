"use client";

import { HeroBlock } from "@/types/blocks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePicker } from "../../media/ImagePicker";
import { LinkInput } from "../LinkInput";
import { RichTextEditor } from "../RichTextEditor";
import { JSONContent } from "@tiptap/react";

interface HeroBlockEditorProps {
  block: HeroBlock;
  onChange: (data: Partial<HeroBlock>) => void;
  tab?: 'content' | 'media' | 'actions' | 'styling';
}

export function HeroBlockEditor({ block, onChange, tab }: HeroBlockEditorProps) {
  // Convert string description to JSONContent for backwards compatibility
  const getDescriptionContent = (): JSONContent => {
    if (!block.description) {
      return { type: 'doc', content: [] };
    }
    // If it's already JSONContent, return it
    if (typeof block.description === 'object' && block.description !== null) {
      return block.description as JSONContent;
    }
    // If it's a string (old format), convert to JSONContent
    if (typeof block.description === 'string') {
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: block.description }],
          },
        ],
      };
    }
    return { type: 'doc', content: [] };
  };

  // If tab is specified, only render that tab's content
  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Rubrik</Label>
          <Input
            value={block.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Huvudrubrik"
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
          <Label>Beskrivning</Label>
          <RichTextEditor
            content={getDescriptionContent()}
            onChange={(content) => onChange({ description: content })}
            placeholder="Valfri beskrivning"
          />
        </div>
      </div>
    );
  }

  if (tab === 'media') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Bakgrundsbild</Label>
          <ImagePicker
            value={block.image}
            onChange={(url) => onChange({ image: url || undefined })}
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
      </div>
    );
  }

  if (tab === 'actions') {
    return (
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground">Primär knapp</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CTA-knapp text</Label>
              <Input
                value={block.ctaText || ""}
                onChange={(e) => onChange({ ctaText: e.target.value })}
                placeholder="Kontakta oss"
              />
            </div>
            <div className="space-y-2">
              <Label>CTA-knapp länk</Label>
              <LinkInput
                value={block.ctaLink || ""}
                onChange={(value) => onChange({ ctaLink: value })}
                placeholder="/kontakt"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground">Sekundär knapp</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sekundär knapp text</Label>
              <Input
                value={block.ctaSecondaryText || ""}
                onChange={(e) => onChange({ ctaSecondaryText: e.target.value })}
                placeholder="Läs mer"
              />
            </div>
            <div className="space-y-2">
              <Label>Sekundär knapp länk</Label>
              <LinkInput
                value={block.ctaSecondaryLink || ""}
                onChange={(value) => onChange({ ctaSecondaryLink: value })}
                placeholder="/om-oss"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'styling') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Layout</Label>
          <Select
            value={block.layout || 'full-bg'}
            onValueChange={(value) => onChange({ layout: value as 'full-bg' | 'full-bg-left' | 'side-left' | 'side-right' | 'text-top-image-bottom' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-bg">Full bakgrund, centrerad text</SelectItem>
              <SelectItem value="full-bg-left">Full bakgrund, vänsterjusterad text</SelectItem>
              <SelectItem value="side-left">Bild vänster, text höger</SelectItem>
              <SelectItem value="side-right">Bild höger, text vänster</SelectItem>
              <SelectItem value="text-top-image-bottom">Text överst, bild underst</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Textfärg</Label>
          <Select
            value={block.textColor || 'light'}
            onValueChange={(value) => onChange({ textColor: value as 'light' | 'dark' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Ljus (vit)</SelectItem>
              <SelectItem value="dark">Mörk (svart)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label>Overlay på bild</Label>
          <Switch
            checked={block.overlay || false}
            onCheckedChange={(checked) => onChange({ overlay: checked })}
          />
        </div>

        {block.overlay && (
          <>
            <div className="space-y-2">
              <Label>Overlay-färg</Label>
              <Select
                value={block.overlayColor || 'dark'}
                onValueChange={(value) => onChange({ overlayColor: value as 'dark' | 'white' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Mörk</SelectItem>
                  <SelectItem value="white">Vit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Overlay-styrka: {Math.round((block.overlayOpacity || 0.5) * 100)}%
              </Label>
              <Slider
                value={[(block.overlayOpacity || 0.5) * 100]}
                onValueChange={([value]) =>
                  onChange({ overlayOpacity: value / 100 })
                }
                min={0}
                max={100}
                step={5}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  // Default: render all content (for backwards compatibility when tab is not specified)
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Rubrik</Label>
        <Input
          value={block.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Huvudrubrik"
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
        <Label>Beskrivning</Label>
        <RichTextEditor
          content={getDescriptionContent()}
          onChange={(content) => onChange({ description: content })}
          placeholder="Valfri beskrivning"
        />
      </div>

      <div className="space-y-2">
        <Label>Layout</Label>
        <Select
          value={block.layout || 'full-bg'}
          onValueChange={(value) => onChange({ layout: value as 'full-bg' | 'full-bg-left' | 'side-left' | 'side-right' | 'text-top-image-bottom' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-bg">Full bakgrund, centrerad text</SelectItem>
            <SelectItem value="full-bg-left">Full bakgrund, vänsterjusterad text</SelectItem>
            <SelectItem value="side-left">Bild vänster, text höger</SelectItem>
            <SelectItem value="side-right">Bild höger, text vänster</SelectItem>
            <SelectItem value="text-top-image-bottom">Text överst, bild underst</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Textfärg</Label>
        <Select
          value={block.textColor || 'light'}
          onValueChange={(value) => onChange({ textColor: value as 'light' | 'dark' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Ljus (vit)</SelectItem>
            <SelectItem value="dark">Mörk (svart)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Bakgrundsbild</Label>
        <ImagePicker
          value={block.image}
          onChange={(url) => onChange({ image: url || undefined })}
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
        <Label>CTA-knapp text</Label>
        <Input
          value={block.ctaText || ""}
          onChange={(e) => onChange({ ctaText: e.target.value })}
          placeholder="Kontakta oss"
        />
      </div>
      <div className="space-y-2">
        <Label>CTA-knapp länk</Label>
        <LinkInput
          value={block.ctaLink || ""}
          onChange={(value) => onChange({ ctaLink: value })}
          placeholder="/kontakt"
        />
      </div>

      <div className="space-y-2">
        <Label>Sekundär knapp text</Label>
        <Input
          value={block.ctaSecondaryText || ""}
          onChange={(e) => onChange({ ctaSecondaryText: e.target.value })}
          placeholder="Läs mer"
        />
      </div>
      <div className="space-y-2">
        <Label>Sekundär knapp länk</Label>
        <LinkInput
          value={block.ctaSecondaryLink || ""}
          onChange={(value) => onChange({ ctaSecondaryLink: value })}
          placeholder="/om-oss"
        />
      </div>

      {(block.layout === 'full-bg' || block.layout === 'full-bg-left' || !block.layout) && (
        <>
          <div className="flex items-center justify-between">
            <Label>Overlay på bild</Label>
            <Switch
              checked={block.overlay || false}
              onCheckedChange={(checked) => onChange({ overlay: checked })}
            />
          </div>

          {block.overlay && (
            <>
              <div className="space-y-2">
                <Label>Overlay-färg</Label>
                <Select
                  value={block.overlayColor || 'dark'}
                  onValueChange={(value) => onChange({ overlayColor: value as 'dark' | 'white' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Mörk</SelectItem>
                    <SelectItem value="white">Vit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  Overlay-styrka: {Math.round((block.overlayOpacity || 0.5) * 100)}%
                </Label>
                <Slider
                  value={[(block.overlayOpacity || 0.5) * 100]}
                  onValueChange={([value]) =>
                    onChange({ overlayOpacity: value / 100 })
                  }
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
