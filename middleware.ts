import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = ['/admin', '/konto'];

/**
 * Routes that should redirect to home if already authenticated
 */
const AUTH_ROUTES = ['/logga-in', '/admin/login'];

/**
 * Routes related to 2FA setup/verification (should skip 2FA check)
 */
const TWO_FACTOR_ROUTES = ['/auth/2fa-setup', '/auth/2fa-verify'];

/**
 * Admin roles that can access the admin panel
 */
const ADMIN_ROLES = ['super_admin', 'admin', 'editor', 'author'];

/**
 * Check if a user must complete 2FA setup (grace period expired).
 */
async function requiresTwoFactorSetup(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      twoFactorEnabled: true,
      twoFactorGraceExpiresAt: true,
    },
  });

  if (!user) {
    return false;
  }

  // If 2FA is already enabled, no setup required
  if (user.twoFactorEnabled) {
    return false;
  }

  // If no grace period is set, initialize it and allow through
  if (!user.twoFactorGraceExpiresAt) {
    const graceExpiresAt = new Date();
    graceExpiresAt.setDate(graceExpiresAt.getDate() + 30);
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorGraceExpiresAt: graceExpiresAt },
    });
    return false;
  }

  // Check if grace period has expired
  return new Date() >= user.twoFactorGraceExpiresAt;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Get session from better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAuthenticated = !!session?.user;
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isTwoFactorRoute = TWO_FACTOR_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check 2FA requirement for authenticated users (skip 2FA pages themselves)
  if (isAuthenticated && !isTwoFactorRoute && session?.user?.id) {
    const needs2FASetup = await requiresTwoFactorSetup(session.user.id);
    if (needs2FASetup) {
      const setupUrl = new URL('/auth/2fa-setup', request.url);
      setupUrl.searchParams.set('required', 'true');
      setupUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(setupUrl);
    }
  }

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isKontoRoute = pathname.startsWith('/konto');

  // Protect admin routes
  if (isAdminRoute) {
    // Skip admin login page itself
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Not authenticated - redirect to admin login
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has admin role
    // Note: session.user may not include role, we need to check via API or database
    // For now, we allow through and let the layout handle role checking
    // This provides a first layer of defense (authentication)
  }

  // Protect /konto routes - redirect to customer login
  if (isKontoRoute && !isAuthenticated) {
    const loginUrl = new URL('/logga-in', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (they handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
