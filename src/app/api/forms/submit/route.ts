import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { queueHubSpotSync } from '@/lib/hubspot';
import { contactFormSubmissionSchema } from '@/schemas/contact-form';
import crypto from 'crypto';

/**
 * POST /api/forms/submit
 * Handle contact form submissions
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const result = contactFormSubmissionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Valideringsfel',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = result.data;

    // Verify Turnstile token (if provided)
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     undefined;
    
    const turnstileResult = await verifyTurnstileToken(data.turnstileToken, clientIp);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { error: turnstileResult.error || 'Verifieringen misslyckades' },
        { status: 400 }
      );
    }

    // Hash IP for privacy (for spam detection)
    const ipHash = clientIp 
      ? crypto.createHash('sha256').update(clientIp).digest('hex').substring(0, 16)
      : null;

    // Create form submission
    const submission = await prisma.formSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        orgNumber: data.orgNumber || null,
        message: data.message || null,
        page: data.page || null,
        formType: data.formType,
        serviceCategory: data.serviceCategory || null,
        serviceSlug: data.serviceSlug || null,
        productSlug: data.productSlug || null,
        campaignId: data.campaignId || null,
        variantId: data.variantId || null,
        utmSource: data.utmSource || null,
        utmMedium: data.utmMedium || null,
        utmCampaign: data.utmCampaign || null,
        utmTerm: data.utmTerm || null,
        utmContent: data.utmContent || null,
        marketingConsent: data.marketingConsent,
        turnstileToken: data.turnstileToken || null,
        ipHash,
        userAgent: request.headers.get('user-agent') || null,
        referrer: request.headers.get('referer') || null,
      },
    });

    // Increment campaign variant conversion counter if applicable
    if (data.campaignId && data.variantId) {
      try {
        await prisma.campaignVariant.update({
          where: { id: data.variantId },
          data: {
            conversions: { increment: 1 },
          },
        });
      } catch (error) {
        // Don't fail the submission if variant update fails
        console.error('Failed to update campaign variant conversions:', error);
      }
    }

    // Queue async HubSpot sync (doesn't block response)
    queueHubSpotSync({
      ...data,
      id: submission.id,
    });

    return NextResponse.json(
      {
        success: true,
        id: submission.id,
        message: 'Tack för ditt meddelande!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Form submission error:', error);

    return NextResponse.json(
      { error: 'Ett tekniskt fel uppstod. Försök igen.' },
      { status: 500 }
    );
  }
}
