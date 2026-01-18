import { BlockType } from '@/types/blocks';
import { ComponentType } from 'react';

// Import all block editors
import { SpacerBlockEditor } from './SpacerBlockEditor';
import { DividerBlockEditor } from './DividerBlockEditor';
import { RichTextBlockEditor } from './RichTextBlockEditor';
import { HeroBlockEditor } from './HeroBlockEditor';
import { HeroWithFormBlockEditor } from './HeroWithFormBlockEditor';
import { TextImageBlockEditor } from './TextImageBlockEditor';
import { FeatureListBlockEditor } from './FeatureListBlockEditor';
import { FeatureCardsBlockEditor } from './FeatureCardsBlockEditor';
import { FAQBlockEditor } from './FAQBlockEditor';
import { AccordionBlockEditor } from './AccordionBlockEditor';
import { TabsBlockEditor } from './TabsBlockEditor';
import { CTABlockEditor } from './CTABlockEditor';
import { CTAWithImageBlockEditor } from './CTAWithImageBlockEditor';
import { ContactFormBlockEditor } from './ContactFormBlockEditor';
import { TestimonialsBlockEditor } from './TestimonialsBlockEditor';
import { TestimonialSingleBlockEditor } from './TestimonialSingleBlockEditor';
import { StatsBlockEditor } from './StatsBlockEditor';
import { LogoGridBlockEditor } from './LogoGridBlockEditor';
import { TeamGridBlockEditor } from './TeamGridBlockEditor';
import { ServiceCardsBlockEditor } from './ServiceCardsBlockEditor';
import { ProductCardsBlockEditor } from './ProductCardsBlockEditor';
import { VideoEmbedBlockEditor } from './VideoEmbedBlockEditor';
import { ImageGalleryBlockEditor } from './ImageGalleryBlockEditor';
import { MapBlockEditor } from './MapBlockEditor';
import { ComparisonBlockEditor } from './ComparisonBlockEditor';
import { TimelineBlockEditor } from './TimelineBlockEditor';
import { HTMLEmbedBlockEditor } from './HTMLEmbedBlockEditor';

// Simplified block editors
import { SingleImageBlockEditor } from './simplified/SingleImageBlockEditor';
import { SimpleTableBlockEditor } from './simplified/SimpleTableBlockEditor';
import { QuoteBlockEditor } from './simplified/QuoteBlockEditor';
import { InlineCTABlockEditor } from './simplified/InlineCTABlockEditor';

interface BlockEditorProps {
  block: any;
  onChange: (data: any) => void;
  tab?: 'content' | 'media' | 'actions' | 'styling';
}

const BLOCK_EDITORS: Partial<Record<BlockType, ComponentType<BlockEditorProps>>> = {
  spacer: SpacerBlockEditor,
  divider: DividerBlockEditor,
  richText: RichTextBlockEditor,
  hero: HeroBlockEditor,
  heroWithForm: HeroWithFormBlockEditor,
  textImage: TextImageBlockEditor,
  featureList: FeatureListBlockEditor,
  featureCards: FeatureCardsBlockEditor,
  faq: FAQBlockEditor,
  accordion: AccordionBlockEditor,
  tabs: TabsBlockEditor,
  cta: CTABlockEditor,
  ctaWithImage: CTAWithImageBlockEditor,
  contactForm: ContactFormBlockEditor,
  testimonials: TestimonialsBlockEditor,
  testimonialSingle: TestimonialSingleBlockEditor,
  stats: StatsBlockEditor,
  logoGrid: LogoGridBlockEditor,
  teamGrid: TeamGridBlockEditor,
  serviceCards: ServiceCardsBlockEditor,
  productCards: ProductCardsBlockEditor,
  videoEmbed: VideoEmbedBlockEditor,
  imageGallery: ImageGalleryBlockEditor,
  map: MapBlockEditor,
  comparison: ComparisonBlockEditor,
  timeline: TimelineBlockEditor,
  htmlEmbed: HTMLEmbedBlockEditor,
  // Simplified blocks
  singleImage: SingleImageBlockEditor,
  simpleTable: SimpleTableBlockEditor,
  quote: QuoteBlockEditor,
  inlineCTA: InlineCTABlockEditor,
};

export function getBlockEditor(type: BlockType): ComponentType<BlockEditorProps> | null {
  return BLOCK_EDITORS[type] || null;
}
