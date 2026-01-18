import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Autentisering | Work Safe',
  description: 'Autentisering och säkerhet',
  robots: {
    index: false,
    follow: false,
  },
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      {children}
    </div>
  );
}
