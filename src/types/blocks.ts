import { JSONContent } from "@tiptap/react";

// All block types
export type BlockType =
  | "hero"
  | "heroWithForm"
  | "richText"
  | "textImage"
  | "featureList"
  | "featureCards"
  | "faq"
  | "cta"
  | "ctaWithImage"
  | "teamGrid"
  | "logoGrid"
  | "stats"
  | "testimonials"
  | "testimonialSingle"
  | "serviceCards"
  | "productCards"
  | "contactForm"
  | "videoEmbed"
  | "imageGallery"
  | "accordion"
  | "tabs"
  | "comparison"
  | "timeline"
  | "map"
  | "htmlEmbed"
  | "spacer"
  | "divider"
  // Simplified blocks (for Services & Blog)
  | "singleImage"
  | "simpleTable"
  | "quote"
  | "inlineCTA";

// Common settings for all blocks
export interface BlockSettings {
  background?: "white" | "gray" | "primary" | "dark";
  paddingTop?: "none" | "sm" | "md" | "lg";
  paddingBottom?: "none" | "sm" | "md" | "lg";
  maxWidth?: "xl" | "full";
  anchor?: string;
}

// Base block interface
export interface BaseBlock extends BlockSettings {
  id: string;
  type: BlockType;
}

// Individual block types
export interface HeroBlock extends BaseBlock {
  type: "hero";
  title: string;
  subtitle?: string;
  description?: JSONContent;
  image?: string;
  imageAlt?: string;
  ctaText?: string;
  ctaLink?: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
  textColor?: "light" | "dark";
  layout?:
    | "full-bg"
    | "full-bg-left"
    | "side-left"
    | "side-right"
    | "text-top-image-bottom";
  overlay?: boolean;
  overlayColor?: "dark" | "white";
  overlayOpacity?: number;
}

export interface HeroWithFormBlock extends BaseBlock {
  type: "heroWithForm";
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  formId?: string;
  formTitle?: string;
}

export interface RichTextBlock extends BaseBlock {
  type: "richText";
  content: JSONContent;
}

export interface TextImageBlock extends BaseBlock {
  type: "textImage";
  title?: string;
  text: string;
  image: string;
  imageAlt?: string;
  imagePosition: "left" | "right";
  ctaText?: string;
  ctaLink?: string;
}

export interface FeatureListBlock extends BaseBlock {
  type: "featureList";
  title?: string;
  subtitle?: string;
  columns: 2 | 3 | 4;
  features: Array<{
    icon: string;
    title: string;
    description: JSONContent;
  }>;
}

export interface FeatureCardsBlock extends BaseBlock {
  type: "featureCards";
  title?: string;
  subtitle?: string;
  cards: Array<{
    icon: string;
    title: string;
    description: JSONContent;
    link?: string;
  }>;
}

export interface FAQBlock extends BaseBlock {
  type: "faq";
  title?: string;
  subtitle?: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
}

export interface CTABlock extends BaseBlock {
  type: "cta";
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
  style: "primary" | "secondary" | "outline";
}

export interface CTAWithImageBlock extends BaseBlock {
  type: "ctaWithImage";
  title: string;
  subtitle?: string;
  image: string;
  imageAlt?: string;
  imagePosition: "left" | "right";
  ctaText: string;
  ctaLink: string;
}

export interface TeamGridBlock extends BaseBlock {
  type: "teamGrid";
  title?: string;
  subtitle?: string;
  members: Array<{
    name: string;
    role: string;
    image?: string;
    imageAlt?: string;
    email?: string;
    linkedin?: string;
  }>;
}

export interface LogoGridBlock extends BaseBlock {
  type: "logoGrid";
  title?: string;
  subtitle?: string;
  logos: Array<{
    image: string;
    alt: string;
    link?: string;
  }>;
  grayscale?: boolean;
}

export interface StatsBlock extends BaseBlock {
  type: "stats";
  title?: string;
  stats: Array<{
    number: string;
    suffix?: string;
    label: string;
  }>;
}

export interface TestimonialsBlock extends BaseBlock {
  type: "testimonials";
  title?: string;
  subtitle?: string;
  testimonialIds: string[];
  layout: "carousel" | "grid";
}

export interface TestimonialSingleBlock extends BaseBlock {
  type: "testimonialSingle";
  testimonialId: string;
  style: "card" | "quote" | "featured";
}

export interface ServiceCardsBlock extends BaseBlock {
  type: "serviceCards";
  title?: string;
  subtitle?: string;
  serviceIds?: string[];
  categoryId?: string;
  columns: 2 | 3 | 4;
}

export interface ProductCardsBlock extends BaseBlock {
  type: "productCards";
  title?: string;
  subtitle?: string;
  productIds?: string[];
  categoryId?: string;
  columns: 2 | 3 | 4;
  showPrice?: boolean;
}

// Form field identifiers
export type FormFieldId =
  | "name"
  | "email"
  | "phone"
  | "company"
  | "orgNumber"
  | "category"
  | "message"
  | "marketingConsent";

// Configuration for each form field
export interface FormFieldConfig {
  id: FormFieldId;
  enabled: boolean;
  required: boolean;
  label?: string;
  placeholder?: string;
}

// Custom category option for the category dropdown
export interface CategoryOption {
  value: string;
  label: string;
}

// Form preset types
export type FormPreset = "contact" | "quote" | "callback" | "newsletter";

// Category mode for the form
export type CategoryMode = "system" | "custom" | "hidden";

export interface ContactFormBlock extends BaseBlock {
  type: "contactForm";

  // Template reference (if using a saved template)
  templateId?: string;

  // Header
  title?: string;
  subtitle?: string;

  // Which preset is used (for reference in editor)
  preset: FormPreset;

  // Legacy formType for backwards compatibility
  formType?: "contact" | "quote" | "callback" | "newsletter";

  // Field configuration - overrides preset defaults
  fields?: FormFieldConfig[];

  // Category dropdown configuration
  categoryMode?: CategoryMode;
  categoryLabel?: string;
  customCategories?: CategoryOption[];
  categoryId?: string; // Legacy: pre-selected system category

  // Button & success
  submitButtonText?: string;
  successMessage?: string;

  // Privacy
  privacyLinkText?: string;
}

export interface VideoEmbedBlock extends BaseBlock {
  type: "videoEmbed";
  title?: string;
  subtitle?: string;
  videoUrl: string;
  thumbnail?: string;
  thumbnailAlt?: string;
}

export interface ImageGalleryBlock extends BaseBlock {
  type: "imageGallery";
  title?: string;
  images: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  columns: 2 | 3 | 4;
  lightbox?: boolean;
}

export interface AccordionBlock extends BaseBlock {
  type: "accordion";
  title?: string;
  items: Array<{
    title: string;
    content: string;
  }>;
}

export interface TabsBlock extends BaseBlock {
  type: "tabs";
  title?: string;
  tabs: Array<{
    label: string;
    content: string;
  }>;
}

export interface ComparisonBlock extends BaseBlock {
  type: "comparison";
  title?: string;
  items: Array<{
    name: string;
    features: string[];
    price?: string;
    ctaText?: string;
    ctaLink?: string;
    highlighted?: boolean;
  }>;
}

export interface TimelineBlock extends BaseBlock {
  type: "timeline";
  title?: string;
  items: Array<{
    date: string;
    title: string;
    description: JSONContent;
  }>;
}

export interface MapBlock extends BaseBlock {
  type: "map";
  title?: string;
  address: string;
  lat: number;
  lng: number;
  zoom: number;
}

export interface HTMLEmbedBlock extends BaseBlock {
  type: "htmlEmbed";
  code: string;
  sandboxed?: boolean;
}

export interface SpacerBlock extends BaseBlock {
  type: "spacer";
  height: "sm" | "md" | "lg" | "xl";
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  style: "line" | "dots" | "none";
}

// Simplified blocks for Services & Blog
export interface SingleImageBlock extends BaseBlock {
  type: "singleImage";
  url: string;
  alt?: string;
  caption?: string;
  size?: "small" | "medium" | "large" | "full";
}

export interface SimpleTableBlock extends BaseBlock {
  type: "simpleTable";
  title?: string;
  headers: string[];
  rows: string[][];
  striped?: boolean;
}

export interface QuoteBlock extends BaseBlock {
  type: "quote";
  text: string;
  author?: string;
  role?: string;
  image?: string;
}

export interface InlineCTABlock extends BaseBlock {
  type: "inlineCTA";
  text: string;
  link: string;
  style: "primary" | "secondary" | "outline";
  align?: "left" | "center" | "right";
}

// Union type of all blocks
export type ContentBlock =
  | HeroBlock
  | HeroWithFormBlock
  | RichTextBlock
  | TextImageBlock
  | FeatureListBlock
  | FeatureCardsBlock
  | FAQBlock
  | CTABlock
  | CTAWithImageBlock
  | TeamGridBlock
  | LogoGridBlock
  | StatsBlock
  | TestimonialsBlock
  | TestimonialSingleBlock
  | ServiceCardsBlock
  | ProductCardsBlock
  | ContactFormBlock
  | VideoEmbedBlock
  | ImageGalleryBlock
  | AccordionBlock
  | TabsBlock
  | ComparisonBlock
  | TimelineBlock
  | MapBlock
  | HTMLEmbedBlock
  | SpacerBlock
  | DividerBlock
  | SingleImageBlock
  | SimpleTableBlock
  | QuoteBlock
  | InlineCTABlock;

// Simplified block types for Services & Blog editors
export const SIMPLIFIED_BLOCK_TYPES: BlockType[] = [
  "richText",
  "singleImage",
  "videoEmbed",
  "divider",
  "tabs",
  "simpleTable",
  "inlineCTA",
  "quote",
];
