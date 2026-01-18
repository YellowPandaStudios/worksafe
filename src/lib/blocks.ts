import { BlockType, ContentBlock } from "@/types/blocks";
import { JSONContent } from "@tiptap/react";
import { nanoid } from "nanoid";

export interface BlockDefinition {
  type: BlockType;
  label: string;
  labelSv: string;
  description: string;
  icon: string; // Lucide icon name
  category: "content" | "media" | "cta" | "social" | "layout" | "advanced";
  defaultData: Partial<ContentBlock>;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  // Content
  {
    type: "hero",
    label: "Hero",
    labelSv: "Hero",
    description: "Large header with image, title and CTA",
    icon: "Layout",
    category: "content",
    defaultData: {
      title: "Rubrik",
      subtitle: "",
      overlay: true,
      overlayOpacity: 0.5,
    },
  },
  {
    type: "heroWithForm",
    label: "Hero with Form",
    labelSv: "Hero med formulär",
    description: "Hero section with embedded lead form",
    icon: "LayoutTemplate",
    category: "content",
    defaultData: {
      title: "Rubrik",
      subtitle: "",
      formTitle: "Kontakta oss",
    },
  },
  {
    type: "richText",
    label: "Rich Text",
    labelSv: "Textblock",
    description: "Free-form text content with formatting",
    icon: "FileText",
    category: "content",
    defaultData: {
      content: { type: "doc", content: [{ type: "paragraph" }] },
    },
  },
  {
    type: "textImage",
    label: "Text + Image",
    labelSv: "Text och bild",
    description: "Two-column layout with text and image",
    icon: "Columns",
    category: "content",
    defaultData: {
      title: "",
      text: "",
      image: "",
      imagePosition: "right",
    },
  },
  {
    type: "featureList",
    label: "Feature List",
    labelSv: "Funktionslista",
    description: "Grid of features with icons",
    icon: "Grid3X3",
    category: "content",
    defaultData: {
      title: "",
      subtitle: "",
      columns: 3,
      features: [
        {
          icon: "Check",
          title: "Funktion 1",
          description: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Beskrivning" }],
              },
            ],
          } as JSONContent,
        },
        {
          icon: "Check",
          title: "Funktion 2",
          description: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Beskrivning" }],
              },
            ],
          } as JSONContent,
        },
        {
          icon: "Check",
          title: "Funktion 3",
          description: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Beskrivning" }],
              },
            ],
          } as JSONContent,
        },
      ],
    },
  },
  {
    type: "featureCards",
    label: "Feature Cards",
    labelSv: "Funktionskort",
    description: "Clickable cards with icons and links",
    icon: "LayoutGrid",
    category: "content",
    defaultData: {
      title: "",
      subtitle: "",
      cards: [
        {
          icon: "ArrowRight",
          title: "Kort 1",
          description: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Beskrivning" }],
              },
            ],
          } as JSONContent,
          link: "",
        },
      ],
    },
  },
  {
    type: "faq",
    label: "FAQ",
    labelSv: "Vanliga frågor",
    description: "Accordion FAQ section (generates schema)",
    icon: "HelpCircle",
    category: "content",
    defaultData: {
      title: "Vanliga frågor",
      subtitle: "",
      items: [
        { question: "Fråga 1?", answer: "Svar 1" },
        { question: "Fråga 2?", answer: "Svar 2" },
      ],
    },
  },
  {
    type: "accordion",
    label: "Accordion",
    labelSv: "Dragspel",
    description: "Expandable content sections",
    icon: "ChevronDown",
    category: "content",
    defaultData: {
      title: "",
      items: [{ title: "Sektion 1", content: "Innehåll" }],
    },
  },
  {
    type: "tabs",
    label: "Tabs",
    labelSv: "Flikar",
    description: "Tabbed content sections",
    icon: "PanelTop",
    category: "content",
    defaultData: {
      title: "",
      tabs: [
        { label: "Flik 1", content: "Innehåll" },
        { label: "Flik 2", content: "Innehåll" },
      ],
    },
  },

  // CTA
  {
    type: "cta",
    label: "CTA Banner",
    labelSv: "CTA-banner",
    description: "Call to action banner",
    icon: "MousePointerClick",
    category: "cta",
    defaultData: {
      title: "Redo att komma igång?",
      subtitle: "",
      ctaText: "Kontakta oss",
      ctaLink: "/kontakt",
      style: "primary",
    },
  },
  {
    type: "ctaWithImage",
    label: "CTA with Image",
    labelSv: "CTA med bild",
    description: "Call to action with side image",
    icon: "PanelLeftInactive",
    category: "cta",
    defaultData: {
      title: "Rubrik",
      subtitle: "",
      image: "",
      imagePosition: "right",
      ctaText: "Läs mer",
      ctaLink: "",
    },
  },
  {
    type: "contactForm",
    label: "Contact Form",
    labelSv: "Kontaktformulär",
    description: "Embedded contact/quote form",
    icon: "Send",
    category: "cta",
    defaultData: {
      title: "Kontakta oss",
      subtitle: "",
      formType: "contact",
      successMessage: "Tack för ditt meddelande! Vi återkommer inom kort.",
    },
  },

  // Social Proof
  {
    type: "testimonials",
    label: "Testimonials",
    labelSv: "Kundomdömen",
    description: "Customer testimonial carousel or grid",
    icon: "Quote",
    category: "social",
    defaultData: {
      title: "Vad våra kunder säger",
      subtitle: "",
      testimonialIds: [],
      layout: "carousel",
    },
  },
  {
    type: "testimonialSingle",
    label: "Single Testimonial",
    labelSv: "Enskilt omdöme",
    description: "Highlight a single testimonial",
    icon: "MessageSquareQuote",
    category: "social",
    defaultData: {
      testimonialId: "",
      style: "card",
    },
  },
  {
    type: "stats",
    label: "Stats",
    labelSv: "Statistik",
    description: "Number statistics showcase",
    icon: "TrendingUp",
    category: "social",
    defaultData: {
      title: "",
      stats: [
        { number: "500", suffix: "+", label: "Nöjda kunder" },
        { number: "10", suffix: "+", label: "Års erfarenhet" },
        { number: "98", suffix: "%", label: "Kundnöjdhet" },
      ],
    },
  },
  {
    type: "logoGrid",
    label: "Logo Grid",
    labelSv: "Logotyper",
    description: "Client or partner logos",
    icon: "Building",
    category: "social",
    defaultData: {
      title: "Våra kunder",
      subtitle: "",
      logos: [],
      grayscale: true,
    },
  },
  {
    type: "teamGrid",
    label: "Team Grid",
    labelSv: "Teammedlemmar",
    description: "Team member grid",
    icon: "Users",
    category: "social",
    defaultData: {
      title: "Vårt team",
      subtitle: "",
      members: [],
    },
  },

  // Dynamic Content
  {
    type: "serviceCards",
    label: "Service Cards",
    labelSv: "Tjänstekort",
    description: "Display services as cards",
    icon: "Briefcase",
    category: "content",
    defaultData: {
      title: "Våra tjänster",
      subtitle: "",
      columns: 3,
    },
  },
  {
    type: "productCards",
    label: "Product Cards",
    labelSv: "Produktkort",
    description: "Display products as cards",
    icon: "Package",
    category: "content",
    defaultData: {
      title: "Våra produkter",
      subtitle: "",
      columns: 4,
      showPrice: true,
    },
  },

  // Media
  {
    type: "videoEmbed",
    label: "Video",
    labelSv: "Video",
    description: "YouTube or Vimeo embed",
    icon: "Play",
    category: "media",
    defaultData: {
      title: "",
      subtitle: "",
      videoUrl: "",
    },
  },
  {
    type: "imageGallery",
    label: "Image Gallery",
    labelSv: "Bildgalleri",
    description: "Image grid with lightbox",
    icon: "Images",
    category: "media",
    defaultData: {
      title: "",
      images: [],
      columns: 3,
      lightbox: true,
    },
  },
  {
    type: "map",
    label: "Map",
    labelSv: "Karta",
    description: "Google Maps embed",
    icon: "MapPin",
    category: "media",
    defaultData: {
      title: "",
      address: "",
      lat: 59.3293,
      lng: 18.0686,
      zoom: 14,
    },
  },

  // Advanced
  {
    type: "comparison",
    label: "Comparison",
    labelSv: "Jämförelse",
    description: "Pricing or feature comparison table",
    icon: "Table",
    category: "advanced",
    defaultData: {
      title: "",
      items: [],
    },
  },
  {
    type: "timeline",
    label: "Timeline",
    labelSv: "Tidslinje",
    description: "Chronological timeline",
    icon: "Clock",
    category: "advanced",
    defaultData: {
      title: "",
      items: [],
    },
  },
  {
    type: "htmlEmbed",
    label: "HTML Embed",
    labelSv: "HTML-kod",
    description: "Custom HTML (admin only)",
    icon: "Code",
    category: "advanced",
    defaultData: {
      code: "",
      sandboxed: true,
    },
  },

  // Layout
  {
    type: "spacer",
    label: "Spacer",
    labelSv: "Mellanrum",
    description: "Vertical spacing",
    icon: "SeparatorHorizontal",
    category: "layout",
    defaultData: {
      height: "md",
    },
  },
  {
    type: "divider",
    label: "Divider",
    labelSv: "Avdelare",
    description: "Section divider line",
    icon: "Minus",
    category: "layout",
    defaultData: {
      style: "line",
    },
  },

  // Simplified blocks (for Services & Blog)
  {
    type: "singleImage",
    label: "Single Image",
    labelSv: "Enstaka bild",
    description: "Single image with optional caption",
    icon: "Image",
    category: "media",
    defaultData: {
      url: "",
      alt: "",
      caption: "",
      size: "large",
    },
  },
  {
    type: "simpleTable",
    label: "Simple Table",
    labelSv: "Enkel tabell",
    description: "Basic data table",
    icon: "Table2",
    category: "content",
    defaultData: {
      title: "",
      headers: ["Kolumn 1", "Kolumn 2"],
      rows: [
        ["Rad 1", "Värde"],
        ["Rad 2", "Värde"],
      ],
      striped: true,
    },
  },
  {
    type: "quote",
    label: "Quote",
    labelSv: "Citat",
    description: "Blockquote with attribution",
    icon: "Quote",
    category: "content",
    defaultData: {
      text: "",
      author: "",
      role: "",
    },
  },
  {
    type: "inlineCTA",
    label: "Inline CTA",
    labelSv: "Inline CTA-knapp",
    description: "Simple call-to-action button",
    icon: "MousePointerClick",
    category: "cta",
    defaultData: {
      text: "Läs mer",
      link: "",
      style: "primary",
      align: "left",
    },
  },
];

// Helper functions
export function getBlockDefinition(
  type: BlockType
): BlockDefinition | undefined {
  return BLOCK_DEFINITIONS.find((b) => b.type === type);
}

export function createBlock(type: BlockType): ContentBlock {
  const definition = getBlockDefinition(type);
  if (!definition) throw new Error(`Unknown block type: ${type}`);

  return {
    id: nanoid(),
    type,
    ...definition.defaultData,
  } as ContentBlock;
}

export function duplicateBlock(block: ContentBlock): ContentBlock {
  return {
    ...block,
    id: nanoid(),
  };
}

export function getBlocksByCategory(
  category: BlockDefinition["category"]
): BlockDefinition[] {
  return BLOCK_DEFINITIONS.filter((b) => b.category === category);
}

export const BLOCK_CATEGORIES = [
  { id: "content", label: "Innehåll", icon: "FileText" },
  { id: "cta", label: "Call to Action", icon: "MousePointerClick" },
  { id: "social", label: "Social Proof", icon: "Users" },
  { id: "media", label: "Media", icon: "Image" },
  { id: "advanced", label: "Avancerat", icon: "Settings" },
  { id: "layout", label: "Layout", icon: "Layout" },
] as const;
