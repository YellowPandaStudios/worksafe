'use client';

import { TeamGridBlock } from '@/types/blocks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImagePicker } from '../../media/ImagePicker';
import { Plus, Trash2 } from 'lucide-react';

interface TeamGridBlockEditorProps {
  block: TeamGridBlock;
  onChange: (data: Partial<TeamGridBlock>) => void;
}

export function TeamGridBlockEditor({ block, onChange }: TeamGridBlockEditorProps) {
  const updateMember = (index: number, data: Partial<TeamGridBlock['members'][0]>) => {
    const members = [...block.members];
    members[index] = { ...members[index], ...data };
    onChange({ members });
  };

  const addMember = () => {
    onChange({
      members: [...block.members, { name: '', role: '', image: '', imageAlt: '' }],
    });
  };

  const removeMember = (index: number) => {
    onChange({
      members: block.members.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Rubrik</Label>
        <Input
          value={block.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Vårt team"
        />
      </div>

      <div className="space-y-2">
        <Label>Underrubrik</Label>
        <Input
          value={block.subtitle || ''}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="Valfri underrubrik"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Teammedlemmar</Label>
          <Button type="button" variant="outline" size="sm" onClick={addMember}>
            <Plus className="h-4 w-4 mr-1" />
            Lägg till
          </Button>
        </div>

        {block.members.map((member, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Medlem {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeMember(index)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Namn</Label>
              <Input
                value={member.name}
                onChange={(e) => updateMember(index, { name: e.target.value })}
                placeholder="Förnamn Efternamn"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Roll</Label>
              <Input
                value={member.role}
                onChange={(e) => updateMember(index, { role: e.target.value })}
                placeholder="VD"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Bild</Label>
              <ImagePicker
                value={member.image}
                onChange={(url) => updateMember(index, { image: url || undefined })}
              />
              {member.image && (
                <Input
                  value={member.imageAlt || ''}
                  onChange={(e) => updateMember(index, { imageAlt: e.target.value })}
                  placeholder="Alt-text"
                  className="mt-2"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs">E-post</Label>
                <Input
                  value={member.email || ''}
                  onChange={(e) => updateMember(index, { email: e.target.value })}
                  placeholder="namn@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">LinkedIn</Label>
                <Input
                  value={member.linkedin || ''}
                  onChange={(e) => updateMember(index, { linkedin: e.target.value })}
                  placeholder="linkedin.com/in/..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
