'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Field,
  FieldContent,
  FieldLabel,
} from '@/components/ui/field';
import type { SimpleTableBlock } from '@/types/blocks';

interface SimpleTableBlockEditorProps {
  block: SimpleTableBlock;
  onChange: (data: Partial<SimpleTableBlock>) => void;
}

export function SimpleTableBlockEditor({
  block,
  onChange,
}: SimpleTableBlockEditorProps): React.ReactElement {
  const headers = block.headers || ['Kolumn 1', 'Kolumn 2'];
  const rows = block.rows || [['', '']];

  const updateHeader = (index: number, value: string): void => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    onChange({ headers: newHeaders });
  };

  const updateCell = (rowIndex: number, cellIndex: number, value: string): void => {
    const newRows = rows.map((row, rIdx) =>
      rIdx === rowIndex
        ? row.map((cell, cIdx) => (cIdx === cellIndex ? value : cell))
        : row
    );
    onChange({ rows: newRows });
  };

  const addColumn = (): void => {
    onChange({
      headers: [...headers, `Kolumn ${headers.length + 1}`],
      rows: rows.map((row) => [...row, '']),
    });
  };

  const removeColumn = (index: number): void => {
    if (headers.length <= 1) return;
    onChange({
      headers: headers.filter((_, i) => i !== index),
      rows: rows.map((row) => row.filter((_, i) => i !== index)),
    });
  };

  const addRow = (): void => {
    onChange({
      rows: [...rows, headers.map(() => '')],
    });
  };

  const removeRow = (index: number): void => {
    if (rows.length <= 1) return;
    onChange({
      rows: rows.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel htmlFor="title">Rubrik (valfritt)</FieldLabel>
        <FieldContent>
          <Input
            id="title"
            value={block.title || ''}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Tabellrubrik..."
          />
        </FieldContent>
      </Field>

      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel>Randig tabell</FieldLabel>
          <Switch
            checked={block.striped ?? true}
            onCheckedChange={(checked) => onChange({ striped: checked })}
          />
        </div>
      </Field>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldLabel>Tabelldata</FieldLabel>
          <Button type="button" variant="outline" size="sm" onClick={addColumn}>
            <Plus className="h-3 w-3 mr-1" />
            Kolumn
          </Button>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="p-2 text-left">
                    <div className="flex items-center gap-1">
                      <Input
                        value={header}
                        onChange={(e) => updateHeader(index, e.target.value)}
                        className="h-8 text-sm font-medium"
                        placeholder={`Kolumn ${index + 1}`}
                      />
                      {headers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeColumn(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="p-2">
                      <Input
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, cellIndex, e.target.value)}
                        className="h-8 text-sm"
                        placeholder="..."
                      />
                    </td>
                  ))}
                  <td className="p-2">
                    {rows.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeRow(rowIndex)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-3 w-3 mr-1" />
          Lägg till rad
        </Button>
      </div>
    </div>
  );
}
