"use client";

import { TabsBlock } from "@/types/blocks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface TabsBlockEditorProps {
  block: TabsBlock;
  onChange: (data: Partial<TabsBlock>) => void;
}

export function TabsBlockEditor({ block, onChange }: TabsBlockEditorProps) {
  const updateTab = (index: number, data: Partial<TabsBlock["tabs"][0]>) => {
    const tabs = [...block.tabs];
    tabs[index] = { ...tabs[index], ...data };
    onChange({ tabs });
  };

  const addTab = () => {
    onChange({
      tabs: [...block.tabs, { label: "", content: "" }],
    });
  };

  const removeTab = (index: number) => {
    onChange({
      tabs: block.tabs.filter((_, i) => i !== index),
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
          <Label>Flikar</Label>
          <Button type="button" variant="outline" size="sm" onClick={addTab}>
            <Plus className="h-4 w-4 mr-1" />
            Lägg till
          </Button>
        </div>

        {block.tabs.map((tab, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Flik {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTab(index)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Etikett</Label>
              <Input
                value={tab.label}
                onChange={(e) => updateTab(index, { label: e.target.value })}
                placeholder="Fliknamn"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Innehåll</Label>
              <Textarea
                value={tab.content}
                onChange={(e) => updateTab(index, { content: e.target.value })}
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
