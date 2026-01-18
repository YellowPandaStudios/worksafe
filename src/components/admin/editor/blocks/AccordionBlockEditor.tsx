"use client";

import { AccordionBlock } from "@/types/blocks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface AccordionBlockEditorProps {
  block: AccordionBlock;
  onChange: (data: Partial<AccordionBlock>) => void;
}

export function AccordionBlockEditor({
  block,
  onChange,
}: AccordionBlockEditorProps) {
  const updateItem = (
    index: number,
    data: Partial<AccordionBlock["items"][0]>
  ) => {
    const items = [...block.items];
    items[index] = { ...items[index], ...data };
    onChange({ items });
  };

  const addItem = () => {
    onChange({
      items: [...block.items, { title: "", content: "" }],
    });
  };

  const removeItem = (index: number) => {
    onChange({
      items: block.items.filter((_, i) => i !== index),
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Sektioner</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Lägg till
          </Button>
        </div>

        {block.items.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Sektion {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Titel</Label>
              <Input
                value={item.title}
                onChange={(e) => updateItem(index, { title: e.target.value })}
                placeholder="Sektionstitel"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Innehåll</Label>
              <Textarea
                value={item.content}
                onChange={(e) => updateItem(index, { content: e.target.value })}
                placeholder="Innehåll..."
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
