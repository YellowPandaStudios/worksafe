'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  FileText,
  Briefcase,
  ShoppingBag,
  BookOpen,
  Megaphone,
  ExternalLink,
  Check,
  MessageSquare,
} from 'lucide-react';
import type { ContentItem, ContentType } from '@/app/api/admin/content/route';
import {
  type FormType,
  type ServiceCategory,
  SERVICE_CATEGORY_LABELS,
  FORM_TYPE_LABELS,
} from '@/schemas/contact-form';

interface LinkPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

type TabId = ContentType | 'external' | 'contact';

const TAB_CONFIG: {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'pages', label: 'Sidor', icon: FileText },
  { id: 'services', label: 'Tjänster', icon: Briefcase },
  { id: 'products', label: 'Produkter', icon: ShoppingBag },
  { id: 'posts', label: 'Blogg', icon: BookOpen },
  { id: 'campaigns', label: 'Kampanjer', icon: Megaphone },
  { id: 'contact', label: 'Kontakt', icon: MessageSquare },
  { id: 'external', label: 'Extern', icon: ExternalLink },
];

// Content tabs (not external or contact)
const CONTENT_TABS: ContentType[] = ['pages', 'services', 'products', 'posts', 'campaigns'];

export function LinkPicker({ open, onClose, onSelect }: LinkPickerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('pages');
  const [search, setSearch] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Contact form builder state
  const [contactFormType, setContactFormType] = useState<FormType>('contact');
  const [contactServiceCategory, setContactServiceCategory] = useState<ServiceCategory | ''>('');
  const [contactServiceSlug, setContactServiceSlug] = useState('');
  const [contactProductSlug, setContactProductSlug] = useState('');

  const fetchContent = useCallback(async (type: ContentType, searchTerm: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ type });
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/admin/content?${params}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch content when tab changes or search changes
  useEffect(() => {
    if (CONTENT_TABS.includes(activeTab as ContentType) && open) {
      const debounce = setTimeout(() => {
        fetchContent(activeTab as ContentType, search);
      }, 200);
      return () => clearTimeout(debounce);
    }
  }, [activeTab, search, open, fetchContent]);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setSearch('');
      setExternalUrl('');
      setActiveTab('pages');
      setContactFormType('contact');
      setContactServiceCategory('');
      setContactServiceSlug('');
      setContactProductSlug('');
    }
  }, [open]);

  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  const handleExternalSubmit = () => {
    if (externalUrl.trim()) {
      let url = externalUrl.trim();
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      handleSelect(url);
    }
  };

  // Build contact URL from form state
  const buildContactUrl = (): string => {
    const params = new URLSearchParams();
    
    if (contactFormType !== 'contact') {
      params.append('type', contactFormType);
    }
    
    if (contactServiceCategory) {
      params.append('service', contactServiceCategory);
    }
    
    if (contactServiceSlug) {
      params.append('slug', contactServiceSlug);
    }
    
    if (contactProductSlug) {
      params.append('product', contactProductSlug);
    }
    
    const queryString = params.toString();
    return queryString ? `/kontakt?${queryString}` : '/kontakt';
  };

  const handleContactSubmit = () => {
    handleSelect(buildContactUrl());
  };

  // Handle selecting a service from the service list for contact context
  const handleServiceSelectForContact = (item: ContentItem) => {
    setContactServiceSlug(item.slug);
    // Try to infer category from URL or just leave it for manual selection
  };

  // Handle selecting a product from the product list for contact context
  const handleProductSelectForContact = (item: ContentItem) => {
    setContactProductSlug(item.slug);
  };

  const isContentTab = CONTENT_TABS.includes(activeTab as ContentType);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[440px] sm:w-[440px] sm:max-w-[440px] p-0 flex flex-col">
        <SheetHeader className="p-4 pb-0">
          <SheetTitle>Välj länk</SheetTitle>
        </SheetHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabId)}
          className="flex-1 flex flex-col"
        >
          <TabsList className="mx-4 mt-4 grid grid-cols-4 gap-1 h-auto">
            {TAB_CONFIG.slice(0, 4).map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 text-xs px-2 py-1.5"
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsList className="mx-4 mt-1 grid grid-cols-3 gap-1 h-auto">
            {TAB_CONFIG.slice(4).map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 text-xs px-2 py-1.5"
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Search input for content tabs */}
          {isContentTab && (
            <div className="relative px-4 py-3">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Sök..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {/* Content tabs */}
          {TAB_CONFIG.filter((t) => CONTENT_TABS.includes(t.id as ContentType)).map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="flex-1 m-0 data-[state=inactive]:hidden"
            >
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="px-4 pb-4 space-y-1">
                  {isLoading ? (
                    <>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                      ))}
                    </>
                  ) : items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      {search ? 'Inga resultat hittades' : 'Inget innehåll'}
                    </div>
                  ) : (
                    items.map((item) => (
                      <ContentItemButton
                        key={item.id}
                        item={item}
                        onClick={() => handleSelect(item.url)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}

          {/* Contact URL builder tab */}
          <TabsContent value="contact" className="flex-1 m-0 px-4 pt-4 overflow-auto">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Skapa en länk till kontaktsidan med förvalda parametrar.
              </p>
              
              {/* Form type */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Formulärtyp</Label>
                <Select
                  value={contactFormType}
                  onValueChange={(v) => setContactFormType(v as FormType)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(FORM_TYPE_LABELS) as [FormType, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service category */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Tjänstekategori (valfritt)</Label>
                <Select
                  value={contactServiceCategory || '_none'}
                  onValueChange={(v) => setContactServiceCategory(v === '_none' ? '' : v as ServiceCategory)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Välj kategori..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Ingen kategori</SelectItem>
                    {(Object.entries(SERVICE_CATEGORY_LABELS) as [ServiceCategory, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service slug (for specific service context) */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Tjänst-slug (valfritt)</Label>
                <Input
                  placeholder="t.ex. brandutbildning"
                  value={contactServiceSlug}
                  onChange={(e) => setContactServiceSlug(e.target.value)}
                  className="h-9"
                />
                <p className="text-[10px] text-muted-foreground">
                  Slug för specifik tjänst som kontakten gäller
                </p>
              </div>

              {/* Product slug (for product context) */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Produkt-slug (valfritt)</Label>
                <Input
                  placeholder="t.ex. hjartstartare-zoll"
                  value={contactProductSlug}
                  onChange={(e) => setContactProductSlug(e.target.value)}
                  className="h-9"
                />
                <p className="text-[10px] text-muted-foreground">
                  Slug för specifik produkt som kontakten gäller
                </p>
              </div>

              {/* Preview */}
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  <div className="font-medium mb-1">Förhandsvisning:</div>
                  <div className="font-mono text-[10px] break-all bg-muted p-2 rounded min-h-[2rem]">
                    {buildContactUrl()}
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <Button
                onClick={handleContactSubmit}
                className="w-full"
              >
                <Check className="h-4 w-4 mr-2" />
                Använd kontaktlänk
              </Button>
            </div>
          </TabsContent>

          {/* External URL tab */}
          <TabsContent value="external" className="flex-1 m-0 px-4 pt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ange en extern URL för att länka till en annan webbplats.
              </p>
              <div className="space-y-2">
                <Input
                  placeholder="https://example.com"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleExternalSubmit();
                    }
                  }}
                />
                <Button
                  onClick={handleExternalSubmit}
                  disabled={!externalUrl.trim()}
                  className="w-full"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Använd länk
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function ContentItemButton({
  item,
  onClick,
}: {
  item: ContentItem;
  onClick: () => void;
}) {
  const statusColors: Record<string, string> = {
    published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  const statusLabels: Record<string, string> = {
    published: 'Publicerad',
    draft: 'Utkast',
    archived: 'Arkiverad',
  };

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-3 py-2.5 rounded-md hover:bg-accent text-left transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{item.title}</div>
        <div className="text-xs text-muted-foreground truncate">{item.url}</div>
      </div>
      <Badge
        variant="secondary"
        className={`ml-2 shrink-0 text-[10px] ${statusColors[item.status] || ''}`}
      >
        {statusLabels[item.status] || item.status}
      </Badge>
    </button>
  );
}
