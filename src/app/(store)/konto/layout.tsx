import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerUser } from '@/lib/auth-server';
import { User, Shield, MapPin, Package, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccountLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/konto', label: 'Översikt', icon: User },
  { href: '/konto/sakerhet', label: 'Säkerhet', icon: Shield },
  { href: '/konto/adresser', label: 'Adresser', icon: MapPin },
  { href: '/konto/ordrar', label: 'Ordrar', icon: Package },
];

export default async function AccountLayout({ children }: AccountLayoutProps): Promise<React.ReactElement> {
  const user = await getServerUser();

  if (!user) {
    redirect('/logga-in?redirect=/konto');
  }

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="px-2">
            <h2 className="text-lg font-semibold">Mitt konto</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t">
            <form action="/api/auth/sign-out" method="POST">
              <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" type="submit">
                <LogOut className="h-4 w-4" />
                Logga ut
              </Button>
            </form>
          </div>
        </aside>

        {/* Main content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
