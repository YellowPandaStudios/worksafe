'use client';

import { type LucideIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TabConfig {
  /** Unique tab identifier */
  id: string;
  /** Tab label */
  label: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Badge content (e.g., error count, required indicator) */
  badge?: React.ReactNode;
  /** Tab content */
  content: React.ReactNode;
  /** Disable this tab */
  disabled?: boolean;
}

export interface FormTabsProps {
  /** Tab configurations */
  tabs: TabConfig[];
  /** Default selected tab */
  defaultTab?: string;
  /** Controlled selected tab */
  value?: string;
  /** Tab change callback */
  onValueChange?: (value: string) => void;
  /** Tab list variant */
  variant?: 'default' | 'underline' | 'pills';
  /** Make tab list sticky */
  sticky?: boolean;
  /** Tab content className */
  contentClassName?: string;
  /** Additional className for container */
  className?: string;
}

/**
 * Standardized tabs component for admin forms.
 * Provides consistent styling and behavior across all forms.
 *
 * @example
 * ```tsx
 * <FormTabs
 *   tabs={[
 *     { id: 'content', label: 'Innehåll', content: <ContentTab /> },
 *     { id: 'seo', label: 'SEO', content: <SEOSection form={form} /> },
 *     { id: 'publishing', label: 'Publicering', badge: '!', content: <PublishingSection form={form} /> },
 *   ]}
 *   defaultTab="content"
 * />
 * ```
 */
export function FormTabs({
  tabs,
  defaultTab,
  value,
  onValueChange,
  variant = 'default',
  sticky = false,
  contentClassName,
  className,
}: FormTabsProps): React.ReactElement {
  const defaultValue = defaultTab || tabs[0]?.id;

  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn('w-full', className)}
    >
      <TabsList
        className={cn(
          'w-full justify-start',
          sticky && 'sticky top-0 z-10 bg-background',
          variant === 'underline' && 'border-b rounded-none bg-transparent p-0',
          variant === 'pills' && 'bg-muted/50'
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              className={cn(
                'gap-2',
                variant === 'underline' &&
                  'rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent'
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{tab.label}</span>
              {tab.badge && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 min-w-5 px-1 text-xs"
                >
                  {tab.badge}
                </Badge>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className={cn('mt-6 space-y-6', contentClassName)}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export interface FormTabContentProps {
  /** Tab content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Wrapper for tab content with consistent spacing.
 */
export function FormTabContent({
  children,
  className,
}: FormTabContentProps): React.ReactElement {
  return <div className={cn('space-y-6', className)}>{children}</div>;
}
