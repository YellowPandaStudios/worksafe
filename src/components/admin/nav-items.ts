import {
  LayoutDashboard,
  Briefcase,
  Package,
  FileText,
  File,
  Megaphone,
  Quote,
  Image,
  Inbox,
  ArrowRightLeft,
  Settings,
  FolderTree,
  HeadphonesIcon,
  Mail,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

/**
 * Main navigation items for the admin sidebar.
 * Labels are in Swedish as per project conventions.
 */
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Kategorier', href: '/admin/categories', icon: FolderTree },
  { label: 'Tjänster', href: '/admin/services', icon: Briefcase },
  { label: 'Produkter', href: '/admin/products', icon: Package },
  { label: 'Inlägg', href: '/admin/posts', icon: FileText },
  { label: 'Sidor', href: '/admin/pages', icon: File },
  { label: 'Kampanjer', href: '/admin/campaigns', icon: Megaphone },
  { label: 'Omdömen', href: '/admin/testimonials', icon: Quote },
  { label: 'Support', href: '/admin/support', icon: HeadphonesIcon },
  { label: 'Kontakt', href: '/admin/contact', icon: Mail },
  { label: 'Användare', href: '/admin/users', icon: Users },
  { label: 'Media', href: '/admin/media', icon: Image },
  { label: 'Formulär', href: '/admin/submissions', icon: Inbox },
  { label: 'Redirects', href: '/admin/redirects', icon: ArrowRightLeft },
];

/**
 * Settings item shown at the bottom of the sidebar.
 */
export const ADMIN_SETTINGS_ITEM: NavItem = {
  label: 'Inställningar',
  href: '/admin/settings',
  icon: Settings,
};

/**
 * Grouped navigation for more complex sidebar structures.
 */
export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: 'Struktur',
    items: [
      { label: 'Kategorier', href: '/admin/categories', icon: FolderTree },
      { label: 'Sidor', href: '/admin/pages', icon: File },
    ],
  },
  {
    label: 'Innehåll',
    items: [
      { label: 'Tjänster', href: '/admin/services', icon: Briefcase },
      { label: 'Produkter', href: '/admin/products', icon: Package },
      { label: 'Inlägg', href: '/admin/posts', icon: FileText },
      { label: 'Support', href: '/admin/support', icon: HeadphonesIcon },
      { label: 'Kontakt', href: '/admin/contact', icon: Mail },
    ],
  },
  {
    label: 'Marknadsföring',
    items: [
      { label: 'Kampanjer', href: '/admin/campaigns', icon: Megaphone },
      { label: 'Omdömen', href: '/admin/testimonials', icon: Quote },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Användare', href: '/admin/users', icon: Users },
      { label: 'Media', href: '/admin/media', icon: Image },
      { label: 'Formulär', href: '/admin/submissions', icon: Inbox },
      { label: 'Redirects', href: '/admin/redirects', icon: ArrowRightLeft },
    ],
  },
];
