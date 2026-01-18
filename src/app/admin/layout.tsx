import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Work Safe Admin',
    default: 'Admin | Work Safe',
  },
  description: 'Work Safe CMS Admin Portal',
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Root admin layout - passes through to route group layouts.
 * Authentication is handled by the (dashboard) layout.
 * The (auth) layout is used for login page without auth.
 */
export default function AdminLayout({
  children,
}: AdminLayoutProps): React.ReactElement {
  return <>{children}</>;
}
