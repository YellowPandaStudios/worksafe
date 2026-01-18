import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login | Work Safe',
  description: 'Login to Work Safe Admin Portal',
  robots: {
    index: false,
    follow: false,
  },
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps): React.ReactElement {
  return <>{children}</>;
}
