'use client';

import { cn } from '@/lib/utils';
import type { SimpleTableBlock } from '@/types/blocks';

interface SimpleTableProps {
  block: SimpleTableBlock;
}

export function SimpleTable({ block }: SimpleTableProps): React.ReactElement {
  const { title, headers, rows, striped = true } = block;

  return (
    <div className="overflow-x-auto">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-border">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-sm font-semibold text-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                'border-b border-border',
                striped && rowIndex % 2 === 1 && 'bg-muted/50'
              )}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-3 text-sm text-muted-foreground"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
