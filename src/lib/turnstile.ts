/**
 * Cloudflare Turnstile verification
 * 
 * TODO: Implement actual Turnstile verification when ready
 * - Add TURNSTILE_SECRET_KEY to environment variables
 * - Uncomment verification logic
 */

interface TurnstileVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

interface VerifyResult {
  success: boolean;
  error?: string;
}

/**
 * Verify a Turnstile token server-side
 * 
 * @param token - The token from the Turnstile widget
 * @param remoteIp - Optional IP address of the client
 * @returns Verification result
 */
export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp?: string
): Promise<VerifyResult> {
  // TODO: Enable Turnstile verification
  // For now, always return success to allow form submission during development
  if (!token) {
    // In production, this should return an error
    // return { success: false, error: 'Turnstile token saknas' };
    console.warn('[Turnstile] No token provided, skipping verification (dev mode)');
    return { success: true };
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    // In development without key, skip verification
    console.warn('[Turnstile] No secret key configured, skipping verification');
    return { success: true };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const result: TurnstileVerifyResponse = await response.json();

    if (!result.success) {
      console.error('[Turnstile] Verification failed:', result['error-codes']);
      return {
        success: false,
        error: 'Verifieringen misslyckades. Försök igen.',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('[Turnstile] Verification error:', error);
    return {
      success: false,
      error: 'Ett tekniskt fel uppstod. Försök igen.',
    };
  }
}

/**
 * Get the site key for client-side widget
 */
export function getTurnstileSiteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
}
