import { UserRole } from "@prisma/client";

/**
 * Check if a user has admin-level access (super_admin or admin)
 */
export function isAdmin(role: UserRole | null | undefined): boolean {
  return role === "super_admin" || role === "admin";
}

/**
 * Check if a user has super admin access
 */
export function isSuperAdmin(role: UserRole | null | undefined): boolean {
  return role === "super_admin";
}

/**
 * Check if a user can edit content (super_admin, admin, or editor)
 */
export function canEditContent(role: UserRole | null | undefined): boolean {
  return role === "super_admin" || role === "admin" || role === "editor";
}

/**
 * Check if a user can create content (super_admin, admin, editor, or author)
 */
export function canCreateContent(role: UserRole | null | undefined): boolean {
  return (
    role === "super_admin" ||
    role === "admin" ||
    role === "editor" ||
    role === "author"
  );
}

/**
 * Check if a user is a customer (e-commerce only)
 */
export function isCustomer(role: UserRole | null | undefined): boolean {
  return role === "customer" || !role;
}

/**
 * Get role hierarchy level (higher = more permissions)
 */
export function getRoleLevel(role: UserRole | null | undefined): number {
  switch (role) {
    case "super_admin":
      return 5;
    case "admin":
      return 4;
    case "editor":
      return 3;
    case "author":
      return 2;
    case "customer":
      return 1;
    default:
      return 0;
  }
}

/**
 * Check if role1 has equal or higher permissions than role2
 */
export function hasRoleOrHigher(
  role1: UserRole | null | undefined,
  role2: UserRole
): boolean {
  return getRoleLevel(role1) >= getRoleLevel(role2);
}
