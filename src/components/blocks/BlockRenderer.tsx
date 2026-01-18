import { ContentBlock } from "@/types/blocks";
import { BlockWrapper } from "./BlockWrapper";

// Import all block components
import { Hero } from "./Hero";
import { HeroWithForm } from "./HeroWithForm";
import { RichText } from "./RichText";
import { TextImage } from "./TextImage";
import { FeatureList } from "./FeatureList";
import { FeatureCards } from "./FeatureCards";
import { FAQ } from "./FAQ";
import { CTA } from "./CTA";
import { CTAWithImage } from "./CTAWithImage";
import { ContactForm } from "./ContactForm";
import { Testimonials } from "./Testimonials";
import { TestimonialSingle } from "./TestimonialSingle";
import { Stats } from "./Stats";
import { LogoGrid } from "./LogoGrid";
import { TeamGrid } from "./TeamGrid";
import { ServiceCards } from "./ServiceCards";
import { ProductCards } from "./ProductCards";
import { VideoEmbed } from "./VideoEmbed";
import { ImageGallery } from "./ImageGallery";
import { Accordion } from "./Accordion";
import { Tabs } from "./Tabs";
import { Comparison } from "./Comparison";
import { Timeline } from "./Timeline";
import { Map } from "./Map";
import { HTMLEmbed } from "./HTMLEmbed";
import { Spacer } from "./Spacer";
import { Divider } from "./Divider";
import { SingleImage } from "./SingleImage";
import { SimpleTable } from "./SimpleTable";
import { Quote } from "./Quote";
import { InlineCTA } from "./InlineCTA";

const BLOCK_COMPONENTS: Record<string, React.ComponentType<any>> = {
  hero: Hero,
  heroWithForm: HeroWithForm,
  richText: RichText,
  textImage: TextImage,
  featureList: FeatureList,
  featureCards: FeatureCards,
  faq: FAQ,
  cta: CTA,
  ctaWithImage: CTAWithImage,
  contactForm: ContactForm,
  testimonials: Testimonials,
  testimonialSingle: TestimonialSingle,
  stats: Stats,
  logoGrid: LogoGrid,
  teamGrid: TeamGrid,
  serviceCards: ServiceCards,
  productCards: ProductCards,
  videoEmbed: VideoEmbed,
  imageGallery: ImageGallery,
  accordion: Accordion,
  tabs: Tabs,
  comparison: Comparison,
  timeline: Timeline,
  map: Map,
  htmlEmbed: HTMLEmbed,
  spacer: Spacer,
  divider: Divider,
  singleImage: SingleImage,
  simpleTable: SimpleTable,
  quote: Quote,
  inlineCTA: InlineCTA,
};

interface BlockRendererProps {
  blocks: ContentBlock[];
  campaignId?: string;
  variantId?: string;
}

export function BlockRenderer({
  blocks,
  campaignId,
  variantId,
}: BlockRendererProps) {
  return (
    <>
      {blocks.map((block) => {
        const Component = BLOCK_COMPONENTS[block.type];

        if (!Component) {
          console.warn(`Unknown block type: ${block.type}`);
          return null;
        }

        return (
          <BlockWrapper key={block.id} block={block}>
            <Component
              block={block}
              campaignId={campaignId}
              variantId={variantId}
            />
          </BlockWrapper>
        );
      })}
    </>
  );
}
