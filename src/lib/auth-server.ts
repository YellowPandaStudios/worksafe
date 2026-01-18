import { auth } from "./auth";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";
import {
  isAdmin,
  isSuperAdmin,
  canEditContent,
  canCreateContent,
} from "./roles";

export async function getServerSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

/**
 * Get the current user with their role from the database
 */
export async function getServerUser() {
  const session = await getServerSession();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
    },
  });

  return user;
}

/**
 * Require authentication and return the user with role
 */
export async function requireUser() {
  const user = await getServerUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

/**
 * Require admin role (super_admin or admin)
 */
export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdmin(user.role)) {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}

/**
 * Require super admin role
 */
export async function requireSuperAdmin() {
  const user = await requireUser();
  if (!isSuperAdmin(user.role)) {
    throw new Error("Forbidden: Super admin access required");
  }
  return user;
}

/**
 * Require content editing permissions (super_admin, admin, or editor)
 */
export async function requireContentEditor() {
  const user = await requireUser();
  if (!canEditContent(user.role)) {
    throw new Error("Forbidden: Content editor access required");
  }
  return user;
}

/**
 * Require content creation permissions (any CMS role)
 */
export async function requireContentCreator() {
  const user = await requireUser();
  if (!canCreateContent(user.role)) {
    throw new Error("Forbidden: Content creator access required");
  }
  return user;
}

/**
 * Check if user has a specific role or higher
 */
export async function requireRole(requiredRole: UserRole) {
  const user = await requireUser();
  const roleLevels: Record<UserRole, number> = {
    super_admin: 5,
    admin: 4,
    editor: 3,
    author: 2,
    customer: 1,
  };

  if (roleLevels[user.role] < roleLevels[requiredRole]) {
    throw new Error(`Forbidden: ${requiredRole} access required`);
  }
  return user;
}
