'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  PanelLeft,
  Image,
  FileText,
  Megaphone,
  HelpCircle,
  Pencil,
  Check,
  Settings2,
  type LucideIcon,
} from 'lucide-react';
import {
  serviceSchema,
  type ServiceFormData,
  type SidebarItem,
  type FaqItem,
} from '@/schemas/service';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { parseBlocks, blocksToJSON } from '@/lib/block-validation';
import { slugify } from '@/lib/slugify';

// Layout & Common
import { ContentEditorHeader } from '../ContentEditorHeader';
import { FormTabs } from '../common/FormTabs';
import { IconSelect } from '../common/IconSelect';

// Form Sections
import { SEOSection } from '../form-sections/SEOSection';
import { AdvancedSettingsSection } from '../form-sections/AdvancedSettingsSection';

// Editor
import { SimplifiedBlockEditor } from '../SimplifiedBlockEditor';
import { ImagePicker } from '../media/ImagePicker';
import { LinkInput } from '../editor/LinkInput';

// CTA types for the form
type CtaType = 'none' | 'form' | 'button';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldGroup,
  FieldLegend,
  FieldDescription,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface FlatCategory {
  id: string;
  name: string;
  slug: string;
  path: string;
  depth: number;
  parentId: string | null;
}

interface FormTemplate {
  id: string;
  name: string;
  slug: string;
  preset: string;
  isActive: boolean;
}

interface ServiceFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    categoryId: string | null;
    subcategory: string | null;
    path: string | null;
    heroTitle: string | null;
    heroSubtitle: string | null;
    heroImage: string | null;
    heroImageAlt: string | null;
    heroButtonsEnabled: boolean;
    heroPrimaryButtonText: string | null;
    heroPrimaryButtonLink: string | null;
    heroSecondaryButtonText: string | null;
    heroSecondaryButtonLink: string | null;
    shortDescription: string;
    sidebarType: string;
    sidebarItems: unknown;
    price: string | null;
    duration: string | null;
    participants: string | null;
    certification: string | null;
    contentBlocks: unknown;
    features: unknown;
    ctaTitle: string | null;
    ctaText: string | null;
    ctaLink: string | null;
    ctaButtonText: string | null;
    hubspotFormId: string | null;
    faqItems: unknown;
    relatedServiceIds: string[];
    metaTitle: string | null;
    metaDescription: string | null;
    ogImage: string | null;
    canonicalUrl: string | null;
    // Advanced settings
    noIndex?: boolean;
    noFollow?: boolean;
    excludeFromSitemap?: boolean;
    isFeatured?: boolean;
    passwordProtected?: boolean;
    password?: string | null;
    redirectOnDelete?: string | null;
    locale?: string | null;
    translationGroupId?: string | null;
    // Publishing
    status: string;
    publishedAt: string | null;
    scheduledFor: string | null;
    sortOrder: number;
  } | null;
}

/**
 * Visual section card with icon and collapsible support
 */
function EditorSection({
  title,
  icon: Icon,
  children,
  className,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}): React.ReactElement {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const headerContent = (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-primary" />}
      <span className="font-semibold text-sm">{title}</span>
    </div>
  );

  if (collapsible) {
    return (
      <div className={cn('border rounded-lg bg-card', className)}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-t-lg"
        >
          {headerContent}
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-xs">{isOpen ? 'Minimera' : 'Expandera'}</span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </button>
        {isOpen && (
          <div className="px-4 pb-4 border-t">
            <div className="pt-4">{children}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('border rounded-lg bg-card', className)}>
      <div className="p-4 border-b bg-muted/30">
        {headerContent}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/**
 * CTA Section content with proper state handling
 */
function CtaSectionContent({
  form,
  formTemplates,
  loadingFormTemplates,
}: {
  form: ReturnType<typeof useForm<ServiceFormData>>;
  formTemplates: FormTemplate[];
  loadingFormTemplates: boolean;
}): React.ReactElement {
  // Determine CTA type based on current values
  const hasForm = !!form.watch('hubspotFormId');
  const hasButton = !!form.watch('ctaLink') || !!form.watch('ctaButtonText');
  const [ctaType, setCtaType] = useState<CtaType>(
    hasForm ? 'form' : hasButton ? 'button' : 'none'
  );

  const handleCtaTypeChange = (newType: CtaType): void => {
    setCtaType(newType);
    if (newType === 'none') {
      form.setValue('hubspotFormId', null);
      form.setValue('ctaLink', null);
      form.setValue('ctaButtonText', null);
    } else if (newType === 'form') {
      form.setValue('ctaLink', null);
      form.setValue('ctaButtonText', null);
    } else if (newType === 'button') {
      form.setValue('hubspotFormId', null);
    }
  };

  return (
    <div className="space-y-4">
      {/* CTA Header */}
      <Field>
        <FieldLabel className="text-xs text-muted-foreground">Rubrik</FieldLabel>
        <Input
          {...form.register('ctaTitle')}
          placeholder="Redo att boka?"
        />
      </Field>

      {/* CTA Text */}
      <Field>
        <FieldLabel className="text-xs text-muted-foreground">Beskrivning</FieldLabel>
        <Textarea
          {...form.register('ctaText')}
          rows={2}
          placeholder="Kontakta oss för mer information..."
        />
      </Field>

      {/* CTA Type Selector */}
      <Field>
        <FieldLabel className="text-xs text-muted-foreground">Typ av CTA</FieldLabel>
        <Select
          value={ctaType}
          onValueChange={(value) => handleCtaTypeChange(value as CtaType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Ingen</SelectItem>
            <SelectItem value="form">Kontaktformulär</SelectItem>
            <SelectItem value="button">Knapp med länk</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {/* Form-specific options */}
      {ctaType === 'form' && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <Field>
            <FieldLabel className="text-xs font-medium">Välj formulär</FieldLabel>
            <Select
              value={form.watch('hubspotFormId') || '_none'}
              onValueChange={(value) =>
                form.setValue('hubspotFormId', value === '_none' ? null : value)
              }
              disabled={loadingFormTemplates}
            >
              <SelectTrigger>
                <SelectValue placeholder="Välj formulär..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Välj ett formulär</SelectItem>
                {formTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription className="text-xs mt-1">
              Formuläret visas direkt i CTA-sektionen
            </FieldDescription>
          </Field>
        </div>
      )}

      {/* Button-specific options */}
      {ctaType === 'button' && (
        <div className="p-3 bg-muted/50 rounded-lg space-y-3">
          <Field>
            <FieldLabel className="text-xs font-medium">Knapptext</FieldLabel>
            <Input
              {...form.register('ctaButtonText')}
              placeholder="Kontakta oss"
            />
          </Field>
          <Field>
            <FieldLabel className="text-xs font-medium">Länk</FieldLabel>
            <LinkInput
              value={form.watch('ctaLink') || ''}
              onChange={(url) => form.setValue('ctaLink', url || null)}
              placeholder="Välj eller skriv länk..."
            />
          </Field>
        </div>
      )}
    </div>
  );
}

/**
 * Sortable sidebar item component
 */
function SortableSidebarItem({
  id,
  item,
  index,
  onUpdate,
  onRemove,
}: {
  id: string;
  item: SidebarItem;
  index: number;
  onUpdate: (data: Partial<SidebarItem>) => void;
  onRemove: () => void;
}): React.ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-muted/50 rounded-md p-2 group',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      {/* Main row: grip + icon + title + delete */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
        </button>
        <IconSelect
          value={item.icon || ''}
          onChange={(icon) => onUpdate({ icon })}
          className="h-8 w-14 shrink-0"
        />
        <Input
          value={item.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Titel"
          className="h-8 flex-1 min-w-0 text-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {/* Description row */}
      <div className="mt-1.5 ml-[22px]">
        <Input
          value={item.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Beskrivning (valfritt)"
          className="h-7 text-xs"
        />
      </div>
    </div>
  );
}

/**
 * Sortable FAQ item component
 */
function SortableFaqItem({
  id,
  item,
  index,
  onUpdate,
  onRemove,
}: {
  id: string;
  item: FaqItem;
  index: number;
  onUpdate: (data: Partial<FaqItem>) => void;
  onRemove: () => void;
}): React.ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-muted/50 rounded-md p-3 space-y-2 group',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none mt-2"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
        </button>
        <span className="text-xs font-medium text-muted-foreground mt-2 w-4">
          {index + 1}.
        </span>
        <div className="flex-1 space-y-2">
          <Input
            value={item.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            placeholder="Fråga..."
            className="font-medium"
          />
          <Textarea
            value={item.answer}
            onChange={(e) => onUpdate({ answer: e.target.value })}
            rows={2}
            placeholder="Svar..."
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function ServiceForm({
  initialData,
}: ServiceFormProps): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);
  const [loadingFormTemplates, setLoadingFormTemplates] = useState(true);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const previewWindowRef = useRef<Window | null>(null);

  // Fetch available categories
  useEffect(() => {
    async function fetchCategories(): Promise<void> {
      try {
        const response = await fetch('/api/admin/categories?format=flat');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // Fetch available form templates
  useEffect(() => {
    async function fetchFormTemplates(): Promise<void> {
      try {
        const response = await fetch('/api/admin/form-templates?active=true');
        if (response.ok) {
          const data = await response.json();
          setFormTemplates(data);
        }
      } catch (error) {
        console.error('Failed to fetch form templates:', error);
      } finally {
        setLoadingFormTemplates(false);
      }
    }
    fetchFormTemplates();
  }, []);

  const form = useForm<ServiceFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(serviceSchema) as any,
    defaultValues: initialData
      ? {
          title: initialData.title,
          slug: initialData.slug,
          categoryId: initialData.categoryId,
          subcategory: initialData.subcategory,
          heroTitle: initialData.heroTitle,
          heroSubtitle: initialData.heroSubtitle,
          heroImage: initialData.heroImage || null,
          heroImageAlt: initialData.heroImageAlt || null,
          heroButtonsEnabled: initialData.heroButtonsEnabled ?? false,
          heroPrimaryButtonText: initialData.heroPrimaryButtonText,
          heroPrimaryButtonLink: initialData.heroPrimaryButtonLink,
          heroSecondaryButtonText: initialData.heroSecondaryButtonText,
          heroSecondaryButtonLink: initialData.heroSecondaryButtonLink,
          shortDescription: initialData.shortDescription,
          sidebarType:
            (initialData.sidebarType as 'benefits' | 'includes' | 'specs') ||
            'benefits',
          sidebarItems: Array.isArray(initialData.sidebarItems)
            ? (initialData.sidebarItems as SidebarItem[])
            : [],
          price: initialData.price,
          duration: initialData.duration,
          participants: initialData.participants,
          certification: initialData.certification,
          contentBlocks: parseBlocks(initialData.contentBlocks),
          features: Array.isArray(initialData.features)
            ? (initialData.features as ServiceFormData['features'])
            : [],
          ctaTitle: initialData.ctaTitle,
          ctaText: initialData.ctaText,
          ctaLink: initialData.ctaLink,
          ctaButtonText: initialData.ctaButtonText,
          hubspotFormId: initialData.hubspotFormId,
          faqItems: Array.isArray(initialData.faqItems)
            ? (initialData.faqItems as FaqItem[])
            : [],
          relatedServiceIds: initialData.relatedServiceIds || [],
          metaTitle: initialData.metaTitle,
          metaDescription: initialData.metaDescription,
          ogImage: initialData.ogImage,
          canonicalUrl: initialData.canonicalUrl,
          // Advanced settings
          noIndex: initialData.noIndex ?? false,
          noFollow: initialData.noFollow ?? false,
          excludeFromSitemap: initialData.excludeFromSitemap ?? false,
          isFeatured: initialData.isFeatured ?? false,
          passwordProtected: initialData.passwordProtected ?? false,
          password: initialData.password,
          redirectOnDelete: initialData.redirectOnDelete,
          locale: initialData.locale,
          translationGroupId: initialData.translationGroupId,
          // Publishing
          status: initialData.status as 'draft' | 'published' | 'archived',
          publishedAt: initialData.publishedAt,
          scheduledFor: initialData.scheduledFor,
          sortOrder: initialData.sortOrder,
        }
      : {
          title: '',
          slug: '',
          categoryId: null,
          subcategory: null,
          heroTitle: null,
          heroSubtitle: null,
          heroImage: null,
          heroImageAlt: null,
          heroButtonsEnabled: false,
          heroPrimaryButtonText: null,
          heroPrimaryButtonLink: null,
          heroSecondaryButtonText: null,
          heroSecondaryButtonLink: null,
          shortDescription: '',
          sidebarType: 'benefits',
          sidebarItems: [],
          price: null,
          duration: null,
          participants: null,
          certification: null,
          contentBlocks: [],
          features: [],
          ctaTitle: null,
          ctaText: null,
          ctaLink: null,
          ctaButtonText: null,
          hubspotFormId: null,
          faqItems: [],
          relatedServiceIds: [],
          metaTitle: null,
          metaDescription: null,
          ogImage: null,
          canonicalUrl: null,
          // Advanced settings
          noIndex: false,
          noFollow: false,
          excludeFromSitemap: false,
          isFeatured: false,
          passwordProtected: false,
          password: null,
          redirectOnDelete: null,
          locale: null,
          translationGroupId: null,
          // Publishing
          status: 'draft',
          publishedAt: null,
          scheduledFor: null,
          sortOrder: 0,
        },
  });

  // Compute preview path
  const slug = form.watch('slug');
  const categoryId = form.watch('categoryId');
  const previewPath = useMemo(() => {
    if (!slug) return null;

    const category = categoryId
      ? categories.find((c) => c.id === categoryId)
      : null;
    if (category) {
      return `${category.path}/${slug}`;
    }

    return `/tjanster/${slug}`;
  }, [slug, categoryId, categories]);

  const handlePreview = (): void => {
    if (previewPath) {
      previewWindowRef.current = window.open(previewPath, 'service-preview');
    }
  };

  const isDirty = form.formState.isDirty;
  const currentStatus = form.watch('status');
  useUnsavedChanges(isDirty);

  // Auto-generate slug from title
  const title = form.watch('title');
  useEffect(() => {
    if (!initialData && title && !form.formState.dirtyFields.slug) {
      const generatedSlug = slugify(title);
      if (generatedSlug) {
        form.setValue('slug', generatedSlug, { shouldDirty: false });
      }
    }
  }, [title, initialData, form]);

  // Auto-save draft
  useAutoSave({
    data: form.watch(),
    onSave: async (data) => {
      if (initialData?.id) {
        const response = await fetch(
          `/api/admin/services/${initialData.id}/draft`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...data,
              contentBlocks: blocksToJSON(data.contentBlocks),
            }),
          }
        );
        if (!response.ok) {
          throw new Error('Auto-save failed');
        }
        setLastSaved(new Date());
      }
    },
    enabled: isDirty && currentStatus === 'draft',
  });

  const handleStatusChange = (
    newStatus: 'draft' | 'published' | 'archived'
  ): void => {
    form.setValue('status', newStatus);
    if (newStatus === 'published' && !form.watch('publishedAt')) {
      form.setValue('publishedAt', new Date().toISOString());
    }
  };

  const onSubmit = async (data: ServiceFormData): Promise<void> => {
    setIsSubmitting(true);

    try {
      const url = initialData?.id
        ? `/api/admin/services/${initialData.id}`
        : '/api/admin/services';

      const response = await fetch(url, {
        method: initialData?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          contentBlocks: blocksToJSON(data.contentBlocks),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      toast.success('Tjänsten har sparats');

      if (previewWindowRef.current && !previewWindowRef.current.closed) {
        previewWindowRef.current.location.reload();
      }

      router.push('/admin/services');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Kunde inte spara tjänsten'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to generate unique IDs
  const generateId = (): string => crypto.randomUUID();

  // Sidebar items management
  const sidebarItems = form.watch('sidebarItems') || [];
  // Ensure all sidebar items have IDs
  const sidebarItemsWithIds = useMemo(() => {
    return sidebarItems.map((item) => ({
      ...item,
      id: item.id || generateId(),
    }));
  }, [sidebarItems]);

  const addSidebarItem = (): void => {
    form.setValue('sidebarItems', [
      ...sidebarItems,
      { id: generateId(), title: '', description: '', icon: '' },
    ], { shouldDirty: true });
  };
  const updateSidebarItem = (id: string, data: Partial<SidebarItem>): void => {
    const newItems = sidebarItemsWithIds.map((item) =>
      item.id === id ? { ...item, ...data } : item
    );
    form.setValue('sidebarItems', newItems, { shouldDirty: true });
  };
  const removeSidebarItem = (id: string): void => {
    form.setValue(
      'sidebarItems',
      sidebarItemsWithIds.filter((item) => item.id !== id),
      { shouldDirty: true }
    );
  };

  // FAQ items management
  const faqItems = form.watch('faqItems') || [];
  // Ensure all FAQ items have IDs
  const faqItemsWithIds = useMemo(() => {
    return faqItems.map((item) => ({
      ...item,
      id: item.id || generateId(),
    }));
  }, [faqItems]);

  const addFaqItem = (): void => {
    form.setValue('faqItems', [...faqItems, { id: generateId(), question: '', answer: '' }], {
      shouldDirty: true,
    });
  };
  const updateFaqItem = (id: string, data: Partial<FaqItem>): void => {
    const newItems = faqItemsWithIds.map((item) =>
      item.id === id ? { ...item, ...data } : item
    );
    form.setValue('faqItems', newItems, { shouldDirty: true });
  };
  const removeFaqItem = (id: string): void => {
    form.setValue(
      'faqItems',
      faqItemsWithIds.filter((item) => item.id !== id),
      { shouldDirty: true }
    );
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Sidebar drag end handler
  const handleSidebarDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sidebarItemsWithIds.findIndex((item) => item.id === active.id);
      const newIndex = sidebarItemsWithIds.findIndex((item) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        form.setValue('sidebarItems', arrayMove([...sidebarItemsWithIds], oldIndex, newIndex), {
          shouldDirty: true,
        });
      }
    }
  };

  // FAQ drag end handler
  const handleFaqDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = faqItemsWithIds.findIndex((item) => item.id === active.id);
      const newIndex = faqItemsWithIds.findIndex((item) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        form.setValue('faqItems', arrayMove([...faqItemsWithIds], oldIndex, newIndex), {
          shouldDirty: true,
        });
      }
    }
  };

  // ============================================================
  // VISUAL PAGE LAYOUT TAB - Mirrors the actual service page
  // ============================================================
  const VisualPageTab = (
    <div className="space-y-6">
      {/* Basic Info */}
      <EditorSection title="Grundläggande" icon={Settings2}>
        <div className="space-y-4">
          {/* Title row with edit slug button */}
          <div className="flex items-end gap-3">
            <Field className="flex-1">
              <FieldLabel htmlFor="title" className="text-xs text-muted-foreground">
                Titel *
              </FieldLabel>
              <FieldContent>
                <Input
                  id="title"
                  {...form.register('title')}
                  aria-invalid={!!form.formState.errors.title}
                  placeholder="Tjänstens namn"
                  className="text-lg font-medium"
                />
                <FieldError errors={[form.formState.errors.title]} />
              </FieldContent>
            </Field>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsEditingSlug(!isEditingSlug)}
              title={isEditingSlug ? 'Klar' : 'Redigera slug'}
              className={cn('shrink-0', isEditingSlug && 'text-primary')}
            >
              {isEditingSlug ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </Button>

            <Select
              value={form.watch('categoryId') || '_none'}
              onValueChange={(value) =>
                form.setValue('categoryId', value === '_none' ? null : value)
              }
              disabled={loadingCategories}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kategori..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">(Ingen kategori)</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {'—'.repeat(cat.depth)} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Slug editing row */}
          {isEditingSlug && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <span className="text-xs text-muted-foreground shrink-0">Slug:</span>
              <Input
                id="slug"
                {...form.register('slug')}
                aria-invalid={!!form.formState.errors.slug}
                placeholder="url-slug"
                className="flex-1 font-mono text-sm"
                autoComplete="off"
              />
            </div>
          )}

          {/* URL Preview */}
          {previewPath && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span>URL:</span>
              <code className="bg-muted px-2 py-1 rounded font-mono">{previewPath}</code>
            </div>
          )}
        </div>
      </EditorSection>

      {/* Two Column Visual Layout - Mirrors the actual page */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN - Sidebar Content (like on the live page) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4 order-2 lg:order-1">
          <EditorSection title="Sidofält" icon={PanelLeft}>
            <div className="space-y-4">
              {/* Sidebar Type */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Typ
                </label>
                <Select
                  value={form.watch('sidebarType')}
                  onValueChange={(value) =>
                    form.setValue('sidebarType', value as 'benefits' | 'includes' | 'specs')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="benefits">Fördelar</SelectItem>
                    <SelectItem value="includes">Vad ingår</SelectItem>
                    <SelectItem value="specs">Specifikationer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sidebar Items */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Punkter
                </label>
                <div className="space-y-2">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleSidebarDragEnd}
                  >
                    <SortableContext
                      items={sidebarItemsWithIds.map((item) => item.id!)}
                      strategy={verticalListSortingStrategy}
                    >
                      {sidebarItemsWithIds.map((item, index) => (
                        <SortableSidebarItem
                          key={item.id}
                          id={item.id!}
                          item={item}
                          index={index}
                          onUpdate={(data) => updateSidebarItem(item.id!, data)}
                          onRemove={() => removeSidebarItem(item.id!)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSidebarItem}
                    className="w-full"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Lägg till punkt
                  </Button>
                </div>
              </div>

              {/* Price & Details - merged into sidebar */}
              <div className="pt-3 border-t space-y-3">
                <label className="text-xs font-medium text-muted-foreground block">
                  Detaljer
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Field>
                    <FieldLabel className="text-xs text-muted-foreground">Pris</FieldLabel>
                    <Input
                      {...form.register('price')}
                      placeholder="Från 2 500 kr"
                      className="h-9"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-xs text-muted-foreground">Längd</FieldLabel>
                    <Input
                      {...form.register('duration')}
                      placeholder="2-3 timmar"
                      className="h-9"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-xs text-muted-foreground">Deltagare</FieldLabel>
                    <Input
                      {...form.register('participants')}
                      placeholder="6-12 st"
                      className="h-9"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-xs text-muted-foreground">Certifiering</FieldLabel>
                    <Input
                      {...form.register('certification')}
                      placeholder="Ingår"
                      className="h-9"
                    />
                  </Field>
                </div>
              </div>
            </div>
          </EditorSection>
        </div>

        {/* RIGHT COLUMN - Main Content (like on the live page) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4 order-1 lg:order-2">
          {/* Hero Section */}
          <EditorSection title="Hero" icon={Image}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Field>
                  <FieldLabel className="text-xs text-muted-foreground">Hero-rubrik</FieldLabel>
                  <Input
                    {...form.register('heroTitle')}
                    placeholder="Lämna tomt för titeln"
                  />
                </Field>
                <Field>
                  <FieldLabel className="text-xs text-muted-foreground">Underrubrik</FieldLabel>
                  <Input
                    {...form.register('heroSubtitle')}
                    placeholder="Kort tagline"
                  />
                </Field>
                <Field>
                  <FieldLabel className="text-xs text-muted-foreground">Kort beskrivning *</FieldLabel>
                  <Textarea
                    {...form.register('shortDescription')}
                    rows={3}
                    placeholder="Beskrivning som visas i hero..."
                    aria-invalid={!!form.formState.errors.shortDescription}
                  />
                  <FieldError errors={[form.formState.errors.shortDescription]} />
                </Field>
              </div>
              <div>
                <FieldLabel className="text-xs text-muted-foreground mb-1.5 block">Hero-bild</FieldLabel>
                <ImagePicker
                  value={form.watch('heroImage')}
                  onChange={(url) => form.setValue('heroImage', url)}
                />
                {form.watch('heroImage') && (
                  <Input
                    {...form.register('heroImageAlt')}
                    placeholder="Alt-text för bilden"
                    className="mt-2"
                  />
                )}
              </div>
            </div>

            {/* Hero Action Buttons */}
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel className="text-xs text-muted-foreground">Knappar i hero</FieldLabel>
                  <p className="text-xs text-muted-foreground/70">Visa call-to-action knappar</p>
                </div>
                <Switch
                  checked={form.watch('heroButtonsEnabled')}
                  onCheckedChange={(checked) => form.setValue('heroButtonsEnabled', checked)}
                />
              </div>

              {form.watch('heroButtonsEnabled') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                  {/* Primary Button */}
                  <div className="space-y-2">
                    <FieldLabel className="text-xs font-medium">Primär knapp</FieldLabel>
                    <Input
                      {...form.register('heroPrimaryButtonText')}
                      placeholder="Kontakta oss"
                    />
                    <LinkInput
                      value={form.watch('heroPrimaryButtonLink') || ''}
                      onChange={(url) => form.setValue('heroPrimaryButtonLink', url)}
                      placeholder="Välj länk..."
                    />
                  </div>

                  {/* Secondary Button */}
                  <div className="space-y-2">
                    <FieldLabel className="text-xs font-medium">Sekundär knapp</FieldLabel>
                    <Input
                      {...form.register('heroSecondaryButtonText')}
                      placeholder="Läs mer"
                    />
                    <LinkInput
                      value={form.watch('heroSecondaryButtonLink') || ''}
                      onChange={(url) => form.setValue('heroSecondaryButtonLink', url)}
                      placeholder="Välj länk..."
                    />
                  </div>
                </div>
              )}
            </div>
          </EditorSection>

          {/* Main Content Blocks */}
          <EditorSection title="Huvudinnehåll" icon={FileText}>
            <SimplifiedBlockEditor
              blocks={form.watch('contentBlocks')}
              onChange={(blocks) => form.setValue('contentBlocks', blocks)}
            />
          </EditorSection>

          {/* CTA Section */}
          <EditorSection
            title="Call to Action"
            icon={Megaphone}
            collapsible
            defaultOpen={!!form.watch('ctaTitle') || !!form.watch('ctaText') || !!form.watch('hubspotFormId') || !!form.watch('ctaLink')}
          >
            <CtaSectionContent
              form={form}
              formTemplates={formTemplates}
              loadingFormTemplates={loadingFormTemplates}
            />
          </EditorSection>

          {/* FAQ Section */}
          <EditorSection
            title="Vanliga frågor (FAQ)"
            icon={HelpCircle}
            collapsible
            defaultOpen={faqItems.length > 0}
          >
            <div className="space-y-3">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleFaqDragEnd}
              >
                <SortableContext
                  items={faqItemsWithIds.map((item) => item.id!)}
                  strategy={verticalListSortingStrategy}
                >
                  {faqItemsWithIds.map((item, index) => (
                    <SortableFaqItem
                      key={item.id}
                      id={item.id!}
                      item={item}
                      index={index}
                      onUpdate={(data) => updateFaqItem(item.id!, data)}
                      onRemove={() => removeFaqItem(item.id!)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFaqItem}
                className="w-full"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Lägg till fråga
              </Button>
            </div>
          </EditorSection>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // SEO TAB
  // ============================================================
  const SEOTab = (
    <div className="max-w-3xl space-y-6">
      <SEOSection form={form} showOgImage showCanonical />

      <AdvancedSettingsSection
        form={form}
        contentTypeName="tjänsten"
        showFeatured
        showPasswordProtection
        showRedirectOnDelete
        showIndexing
        showSitemap
        showLanguage
        defaultCollapsed={false}
      />

      <FieldSet>
        <FieldLegend className="admin-form-section-title">Sortering</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="sortOrder">Sorteringsordning</FieldLabel>
            <FieldContent>
              <Input
                id="sortOrder"
                type="number"
                {...form.register('sortOrder', { valueAsNumber: true })}
                className="w-32"
              />
              <FieldDescription>
                Lägre nummer visas först. Standard är 0.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="admin-form">
      <ContentEditorHeader
        title={form.watch('title') || 'Ny tjänst'}
        status={currentStatus as 'draft' | 'published' | 'archived'}
        onStatusChange={handleStatusChange}
        onPreview={handlePreview}
        previewUrl={previewPath}
        onSave={form.handleSubmit(onSubmit)}
        isSaving={isSubmitting}
        isDirty={isDirty}
        lastSaved={lastSaved}
        backHref="/admin/services"
        backLabel="Tillbaka till tjänster"
        scheduledFor={form.watch('scheduledFor')}
        onSchedule={(date) => form.setValue('scheduledFor', date, { shouldDirty: true })}
      />

      <FormTabs
        tabs={[
          { id: 'page', label: 'Sidinnehåll', content: VisualPageTab },
          { id: 'seo', label: 'SEO & Inställningar', content: SEOTab },
        ]}
        defaultTab="page"
      />

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/services')}
        >
          Avbryt
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sparar...' : 'Spara'}
        </Button>
      </div>
    </form>
  );
}
