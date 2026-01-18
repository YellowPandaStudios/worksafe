"use client";

import { FeatureListBlock } from "@/types/blocks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { RichTextEditor } from "../RichTextEditor";
import { JSONContent } from "@tiptap/react";

interface FeatureListBlockEditorProps {
  block: FeatureListBlock;
  onChange: (data: Partial<FeatureListBlock>) => void;
}

export function FeatureListBlockEditor({
  block,
  onChange,
}: FeatureListBlockEditorProps) {
  // Convert string description to JSONContent for backwards compatibility
  const getDescriptionContent = (desc: string | JSONContent | undefined): JSONContent => {
    if (!desc) {
      return { type: 'doc', content: [] };
    }
    // If it's already JSONContent, return it
    if (typeof desc === 'object' && desc !== null) {
      return desc as JSONContent;
    }
    // If it's a string (old format), convert to JSONContent
    if (typeof desc === 'string') {
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: desc }],
          },
        ],
      };
    }
    return { type: 'doc', content: [] };
  };

  const updateFeature = (
    index: number,
    data: Partial<FeatureListBlock["features"][0]>
  ) => {
    const features = [...block.features];
    features[index] = { ...features[index], ...data };
    onChange({ features });
  };

  const addFeature = () => {
    onChange({
      features: [
        ...block.features,
        { icon: "Check", title: "", description: { type: 'doc', content: [] } },
      ],
    });
  };

  const removeFeature = (index: number) => {
    onChange({
      features: block.features.filter((_, i) => i !== index),
    });
  };

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
        <Label>Underrubrik</Label>
        <Input
          value={block.subtitle || ""}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="Valfri underrubrik"
        />
      </div>

      <div className="space-y-2">
        <Label>Kolumner</Label>
        <Select
          value={block.columns.toString()}
          onValueChange={(value) =>
            onChange({ columns: parseInt(value) as any })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Funktioner</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFeature}
          >
            <Plus className="h-4 w-4 mr-1" />
            Lägg till
          </Button>
        </div>

        {block.features.map((feature, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Funktion {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFeature(index)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Ikon (Lucide)</Label>
              <Input
                value={feature.icon}
                onChange={(e) => updateFeature(index, { icon: e.target.value })}
                placeholder="Check"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Titel</Label>
              <Input
                value={feature.title}
                onChange={(e) =>
                  updateFeature(index, { title: e.target.value })
                }
                placeholder="Funktionstitel"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Beskrivning</Label>
              <RichTextEditor
                content={getDescriptionContent(feature.description)}
                onChange={(content) =>
                  updateFeature(index, { description: content })
                }
                placeholder="Beskrivning"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
