import { Metadata } from 'next';
import { SmartContactForm } from '@/components/forms/SmartContactForm';
import { prisma } from '@/lib/prisma';
import {
  type FormType,
  type ServiceCategory,
  type ContactPageParams,
  SERVICE_CATEGORY_LABELS,
  FORM_TYPE_HEADINGS,
} from '@/schemas/contact-form';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

interface PageProps {
  searchParams: Promise<ContactPageParams>;
}

// Dynamic heading based on context
function getHeading(params: ContactPageParams): string {
  const { type, service } = params;
  
  if (type && type !== 'contact') {
    return FORM_TYPE_HEADINGS[type as FormType];
  }
  
  if (service && service in SERVICE_CATEGORY_LABELS) {
    return `Kontakta oss om ${SERVICE_CATEGORY_LABELS[service as ServiceCategory].toLowerCase()}`;
  }
  
  return 'Kontakta oss';
}

// Dynamic description based on context
function getDescription(params: ContactPageParams): string {
  const { type, service, product } = params;
  
  if (type === 'quote') {
    return 'Fyll i formuläret så skickar vi en kostnadsfri offert anpassad efter dina behov.';
  }
  
  if (type === 'callback') {
    return 'Lämna ditt telefonnummer så ringer vi upp dig så snart vi kan.';
  }
  
  if (type === 'newsletter') {
    return 'Prenumerera på vårt nyhetsbrev för tips, nyheter och exklusiva erbjudanden.';
  }
  
  if (product) {
    return 'Har du frågor om produkten? Fyll i formuläret så hjälper vi dig.';
  }
  
  if (service) {
    return `Vi hjälper dig gärna med frågor om ${SERVICE_CATEGORY_LABELS[service as ServiceCategory]?.toLowerCase() || 'våra tjänster'}.`;
  }
  
  return 'Vi finns här för att hjälpa dig. Fyll i formuläret så återkommer vi så snart vi kan.';
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const heading = getHeading(params);
  
  return {
    title: `${heading} | Work Safe`,
    description: getDescription(params),
    openGraph: {
      title: `${heading} | Work Safe`,
      description: getDescription(params),
    },
  };
}

export default async function ContactPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // Parse parameters
  const formType = (params.type || 'contact') as FormType;
  const serviceCategory = params.service as ServiceCategory | undefined;
  const serviceSlug = params.slug;
  const productSlug = params.product;
  const campaignId = params.campaign;
  const variantId = params.variant;
  
  // UTM parameters
  const utmSource = params.utm_source;
  const utmMedium = params.utm_medium;
  const utmCampaign = params.utm_campaign;
  const utmTerm = params.utm_term;
  const utmContent = params.utm_content;
  
  // Fetch service name if slug provided
  let serviceName: string | undefined;
  if (serviceSlug) {
    const service = await prisma.service.findUnique({
      where: { slug: serviceSlug },
      select: { title: true },
    });
    serviceName = service?.title;
  }
  
  // Fetch product name if slug provided
  let productName: string | undefined;
  if (productSlug) {
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      select: { name: true },
    });
    productName = product?.name;
  }
  
  const heading = getHeading(params);
  const description = getDescription(params);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Left column - Contact Info */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    {heading}
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    {description}
                  </p>
                </div>

                {/* Contact details - hidden for newsletter */}
                {formType !== 'newsletter' && (
                  <div className="space-y-6 pt-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Telefon</h3>
                        <a 
                          href="tel:+46851902010" 
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          08-519 020 10
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">E-post</h3>
                        <a 
                          href="mailto:info@worksafe.se" 
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          info@worksafe.se
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Adress</h3>
                        <p className="text-muted-foreground">
                          Work Safe i Sverige AB<br />
                          Exempelgatan 123<br />
                          123 45 Stockholm
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Öppettider</h3>
                        <p className="text-muted-foreground">
                          Mån–Fre: 08:00–17:00<br />
                          Lör–Sön: Stängt
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Context info */}
                {(serviceName || productName) && (
                  <div className="rounded-lg bg-muted/50 border p-4">
                    <p className="text-sm text-muted-foreground">
                      {productName && (
                        <>
                          Du kontaktar oss angående: <br />
                          <span className="font-medium text-foreground">{productName}</span>
                        </>
                      )}
                      {serviceName && !productName && (
                        <>
                          Du kontaktar oss angående: <br />
                          <span className="font-medium text-foreground">{serviceName}</span>
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Right column - Form */}
              <div className="lg:sticky lg:top-8">
                <div className="rounded-2xl bg-card border shadow-lg p-6 md:p-8">
                  <SmartContactForm
                    formType={formType}
                    serviceCategory={serviceCategory}
                    serviceSlug={serviceSlug}
                    productSlug={productSlug}
                    campaignId={campaignId}
                    variantId={variantId}
                    utmSource={utmSource}
                    utmMedium={utmMedium}
                    utmCampaign={utmCampaign}
                    utmTerm={utmTerm}
                    utmContent={utmContent}
                    productName={productName}
                    serviceName={serviceName}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
