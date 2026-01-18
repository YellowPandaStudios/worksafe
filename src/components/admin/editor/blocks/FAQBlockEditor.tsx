"use client";

import { FAQBlock } from "@/types/blocks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface FAQBlockEditorProps {
  block: FAQBlock;
  onChange: (data: Partial<FAQBlock>) => void;
}

export function FAQBlockEditor({ block, onChange }: FAQBlockEditorProps) {
  const updateItem = (index: number, data: Partial<FAQBlock["items"][0]>) => {
    const items = [...block.items];
    items[index] = { ...items[index], ...data };
    onChange({ items });
  };

  const addItem = () => {
    onChange({
      items: [...block.items, { question: "", answer: "" }],
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
          placeholder="Vanliga frågor"
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Frågor och svar</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Lägg till
          </Button>
        </div>

        {block.items.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Fråga {index + 1}</Label>
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
              <Label className="text-xs">Fråga</Label>
              <Input
                value={item.question}
                onChange={(e) =>
                  updateItem(index, { question: e.target.value })
                }
                placeholder="Vad är...?"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Svar</Label>
              <Textarea
                value={item.answer}
                onChange={(e) => updateItem(index, { answer: e.target.value })}
                placeholder="Svar på frågan..."
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
