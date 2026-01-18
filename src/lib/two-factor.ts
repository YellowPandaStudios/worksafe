import { prisma } from './prisma';

/**
 * Grace period duration in days for 2FA setup
 */
const GRACE_PERIOD_DAYS = 30;

/**
 * User data needed for 2FA checks
 */
interface TwoFactorUser {
  id: string;
  twoFactorEnabled: boolean;
  twoFactorGraceExpiresAt: Date | null;
  createdAt: Date;
}

/**
 * Initialize the 2FA grace period for a user.
 * Sets twoFactorGraceExpiresAt to 30 days from now.
 */
export async function initializeGracePeriod(userId: string): Promise<Date> {
  const graceExpiresAt = new Date();
  graceExpiresAt.setDate(graceExpiresAt.getDate() + GRACE_PERIOD_DAYS);

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorGraceExpiresAt: graceExpiresAt },
  });

  return graceExpiresAt;
}

/**
 * Initialize grace period for all existing users who don't have one set.
 * Useful for migration when enabling 2FA requirement.
 */
export async function initializeGracePeriodForAllUsers(): Promise<number> {
  const graceExpiresAt = new Date();
  graceExpiresAt.setDate(graceExpiresAt.getDate() + GRACE_PERIOD_DAYS);

  const result = await prisma.user.updateMany({
    where: {
      twoFactorEnabled: false,
      twoFactorGraceExpiresAt: null,
    },
    data: { twoFactorGraceExpiresAt: graceExpiresAt },
  });

  return result.count;
}

/**
 * Check if a user is still within their 2FA grace period.
 * Returns true if:
 * - User has 2FA enabled (no grace period needed)
 * - User's grace period hasn't expired yet
 */
export function isInGracePeriod(user: TwoFactorUser): boolean {
  // If 2FA is already enabled, no grace period applies
  if (user.twoFactorEnabled) {
    return true;
  }

  // If no grace period is set, check if it should be initialized
  if (!user.twoFactorGraceExpiresAt) {
    return true; // Will be initialized on next check
  }

  // Check if grace period has expired
  return new Date() < user.twoFactorGraceExpiresAt;
}

/**
 * Check if a user must set up 2FA (grace period expired and 2FA not enabled).
 */
export function requiresTwoFactorSetup(user: TwoFactorUser): boolean {
  // If 2FA is already enabled, no setup required
  if (user.twoFactorEnabled) {
    return false;
  }

  // If no grace period is set, they need to set up but we'll initialize grace period
  if (!user.twoFactorGraceExpiresAt) {
    return false;
  }

  // Check if grace period has expired
  return new Date() >= user.twoFactorGraceExpiresAt;
}

/**
 * Get the number of days remaining in the grace period.
 * Returns 0 if expired or 2FA is already enabled.
 */
export function getGracePeriodDaysRemaining(user: TwoFactorUser): number {
  if (user.twoFactorEnabled) {
    return 0;
  }

  if (!user.twoFactorGraceExpiresAt) {
    return GRACE_PERIOD_DAYS;
  }

  const now = new Date();
  const expiresAt = user.twoFactorGraceExpiresAt;

  if (now >= expiresAt) {
    return 0;
  }

  const diffMs = expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Mark a user as having completed 2FA setup.
 */
export async function markTwoFactorEnabled(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorGraceExpiresAt: null,
    },
  });
}

/**
 * Reset a user's 2FA status (admin action).
 * Deletes their 2FA record and resets the grace period.
 */
export async function resetTwoFactor(userId: string): Promise<void> {
  const graceExpiresAt = new Date();
  graceExpiresAt.setDate(graceExpiresAt.getDate() + GRACE_PERIOD_DAYS);

  await prisma.$transaction([
    // Delete the TwoFactor record if it exists
    prisma.twoFactor.deleteMany({
      where: { userId },
    }),
    // Reset user's 2FA status and set new grace period
    prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorGraceExpiresAt: graceExpiresAt,
      },
    }),
  ]);
}

/**
 * Get 2FA status for a user.
 */
export async function getTwoFactorStatus(userId: string): Promise<{
  enabled: boolean;
  graceExpiresAt: Date | null;
  daysRemaining: number;
  requiresSetup: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      twoFactorEnabled: true,
      twoFactorGraceExpiresAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    enabled: user.twoFactorEnabled,
    graceExpiresAt: user.twoFactorGraceExpiresAt,
    daysRemaining: getGracePeriodDaysRemaining(user),
    requiresSetup: requiresTwoFactorSetup(user),
  };
}
