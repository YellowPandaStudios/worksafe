'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Hash, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UrlParameterBuilderProps {
  url: string;
  onChange: (url: string) => void;
  children: React.ReactNode;
}

interface UrlParts {
  base: string;
  hash: string;
  params: Array<{ key: string; value: string }>;
}

/**
 * Parses a URL into base, query parameters, and hash
 */
function parseUrl(url: string): UrlParts {
  if (!url) {
    return { base: '', hash: '', params: [] };
  }

  // Handle internal links (starting with /)
  if (url.startsWith('/') || url.startsWith('#')) {
    const hashIndex = url.indexOf('#');
    const queryIndex = url.indexOf('?');
    
    let base = url;
    let hash = '';
    let params: Array<{ key: string; value: string }> = [];

    // Extract hash
    if (hashIndex !== -1) {
      base = url.substring(0, hashIndex);
      hash = url.substring(hashIndex + 1);
    }

    // Extract query params
    if (queryIndex !== -1) {
      const beforeQuery = hashIndex !== -1 && hashIndex < queryIndex 
        ? url.substring(0, queryIndex)
        : base;
      base = beforeQuery.substring(0, queryIndex);
      const queryString = hashIndex !== -1 && hashIndex > queryIndex
        ? url.substring(queryIndex + 1, hashIndex)
        : url.substring(queryIndex + 1);
      
      const searchParams = new URLSearchParams(queryString);
      params = Array.from(searchParams.entries()).map(([key, value]) => ({
        key,
        value,
      }));
    }

    return { base, hash, params };
  }

  // Handle external URLs
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const params = Array.from(urlObj.searchParams.entries()).map(([key, value]) => ({
      key,
      value,
    }));

    return {
      base: `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`,
      hash: urlObj.hash.substring(1), // Remove #
      params,
    };
  } catch {
    // If URL parsing fails, treat as base URL
    return { base: url, hash: '', params: [] };
  }
}

/**
 * Reconstructs URL from parts
 */
function buildUrl(parts: UrlParts): string {
  let url = parts.base;

  // Add query parameters
  if (parts.params.length > 0) {
    const searchParams = new URLSearchParams();
    parts.params.forEach(({ key, value }) => {
      if (key.trim()) {
        searchParams.append(key.trim(), value);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Add hash
  if (parts.hash.trim()) {
    url += `#${parts.hash.trim()}`;
  }

  return url;
}

export function UrlParameterBuilder({
  url,
  onChange,
  children,
}: UrlParameterBuilderProps) {
  const [open, setOpen] = useState(false);
  const [parts, setParts] = useState<UrlParts>(() => parseUrl(url));

  // Update parts when url changes externally
  useEffect(() => {
    setParts(parseUrl(url));
  }, [url]);

  const updateParts = (newParts: UrlParts) => {
    setParts(newParts);
    onChange(buildUrl(newParts));
  };

  const addParameter = () => {
    updateParts({
      ...parts,
      params: [...parts.params, { key: '', value: '' }],
    });
  };

  const updateParameter = (index: number, key: string, value: string) => {
    const newParams = [...parts.params];
    newParams[index] = { key, value };
    updateParts({ ...parts, params: newParams });
  };

  const removeParameter = (index: number) => {
    const newParams = parts.params.filter((_, i) => i !== index);
    updateParts({ ...parts, params: newParams });
  };

  const updateHash = (hash: string) => {
    updateParts({ ...parts, hash });
  };

  const updateBase = (base: string) => {
    updateParts({ ...parts, base });
  };

  const hasParamsOrHash = parts.params.length > 0 || parts.hash.trim() !== '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Grund-URL</Label>
            <Input
              placeholder="/sida eller https://example.com"
              value={parts.base}
              onChange={(e) => updateBase(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Query-parametrar</Label>
            <div className="space-y-2">
              {parts.params.map((param, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Nyckel"
                    value={param.key}
                    onChange={(e) =>
                      updateParameter(index, e.target.value, param.value)
                    }
                    className="flex-1 h-8 text-xs"
                  />
                  <Input
                    placeholder="Värde"
                    value={param.value}
                    onChange={(e) =>
                      updateParameter(index, param.key, e.target.value)
                    }
                    className="flex-1 h-8 text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeParameter(index)}
                    className="h-8 w-8 shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addParameter}
                className="w-full h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Lägg till parameter
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5" />
              Hash-fragment
            </Label>
            <Input
              placeholder="t.ex. sektion"
              value={parts.hash}
              onChange={(e) => updateHash(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-1">Förhandsvisning:</div>
              <div className="font-mono text-[10px] break-all bg-muted p-2 rounded min-h-[2rem]">
                {buildUrl(parts) || <span className="text-muted-foreground/50">Ingen URL ännu</span>}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
