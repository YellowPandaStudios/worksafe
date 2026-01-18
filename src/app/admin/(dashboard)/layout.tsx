import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AdminHeader, AdminSidebar } from '@/components/admin/layout';
import { getServerUser } from '@/lib/auth-server';
import { canCreateContent } from '@/lib/roles';

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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps): Promise<React.ReactElement> {
  // Server-side auth check (defense in depth)
  const user = await getServerUser();

  if (!user) {
    redirect('/admin/login?callbackUrl=/admin');
  }

  if (!canCreateContent(user.role)) {
    redirect('/?error=unauthorized');
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
