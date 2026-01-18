'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HeroBlock } from '@/types/blocks';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { JSONContent } from '@tiptap/react';

interface HeroProps {
  block: HeroBlock;
}

export function Hero({ block }: HeroProps) {
  const {
    title,
    subtitle,
    description,
    image,
    imageAlt,
    ctaText,
    ctaLink,
    ctaSecondaryText,
    ctaSecondaryLink,
    textColor: textColorSetting = 'light',
    layout = 'full-bg',
    overlay = true,
    overlayColor = 'dark',
    overlayOpacity = 0.5,
  } = block;

  // Determine text color based on user selection (explicit colors, not theme-dependent)
  const isLightText = textColorSetting === 'light';
  const textColor = isLightText ? 'text-white' : 'text-gray-900 dark:text-gray-100';
  const textColorMuted = isLightText ? 'text-white/90' : 'text-gray-700 dark:text-gray-300';
  const textShadow = isLightText ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]' : '';
  
  // Button styling using design system hero button variants
  const buttonPrimaryClass = isLightText ? 'btn-hero-light' : 'btn-hero-dark';
  const buttonSecondaryClass = isLightText ? 'btn-hero-light-secondary' : 'btn-hero-dark-secondary';

  // Handle description - support both old string format and new JSONContent format
  const getDescriptionContent = (): JSONContent | null => {
    if (!description) return null;
    // If it's already JSONContent, return it
    if (typeof description === 'object' && description !== null) {
      return description as JSONContent;
    }
    // If it's a string (old format), convert to JSONContent
    if (typeof description === 'string') {
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: description }],
          },
        ],
      };
    }
    return null;
  };

  const descriptionContent = getDescriptionContent();

  // Editor for rendering description
  const descriptionEditor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: true,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      ImageExtension.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full' },
      }),
    ],
    content: descriptionContent,
    immediatelyRender: false,
    editable: false,
  });

  // Determine if layout uses full background or side-by-side
  const isFullBgLayout = layout === 'full-bg' || layout === 'full-bg-left';
  const isTextTopImageBottom = layout === 'text-top-image-bottom';
  const isTextLeft = layout === 'full-bg-left' || layout === 'side-left' || layout === 'side-right';

  // Render text-top-image-bottom layout
  if (isTextTopImageBottom && image) {
    return (
      <div className="flex flex-col">
        {/* Text content on top */}
        <div className={cn(
          "relative z-10 w-full py-12 md:py-16 px-4 md:px-6",
          "text-left"
        )}>
          <div className={cn(
            "max-w-[88rem]"
          )}>
            <h1 className={cn(
              "text-fluid-hero font-heading font-bold mb-4 break-words",
              textColor
            )}>
              {title}
            </h1>
            {subtitle && (
              <p className={cn(
                "text-fluid-subheading mb-4",
                textColorMuted
              )}>
                {subtitle}
              </p>
            )}
            {descriptionContent && descriptionEditor && (
              <div className={cn(
                "text-lg mb-12",
                textColorMuted
              )}>
                <div className={cn(
                  "prose prose-sm",
                  isLightText ? "prose-invert" : ""
                )}>
                  <EditorContent editor={descriptionEditor} />
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-start">
              {ctaText && ctaLink && (
                <Button asChild size="xl" className={buttonPrimaryClass}>
                  <Link href={ctaLink}>{ctaText}</Link>
                </Button>
              )}
              {ctaSecondaryText && ctaSecondaryLink && (
                <Button asChild size="xl" variant="secondary" className={buttonSecondaryClass}>
                  <Link href={ctaSecondaryLink}>{ctaSecondaryText}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Image on bottom */}
        <div className="relative w-full min-h-[40vh] md:min-h-[50vh]">
          <Image
            src={image}
            alt={imageAlt || ''}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    );
  }

  // Render side-by-side layout
  if (!isFullBgLayout && image) {
    const isImageLeft = layout === 'side-left';
    
    return (
      <div className="min-h-[60vh] flex flex-col md:flex-row">
        {/* Image side */}
        <div className={cn(
          "relative w-full md:w-1/2 min-h-[40vh] md:min-h-[60vh]",
          isImageLeft ? "md:order-1" : "md:order-2"
        )}>
          <Image
            src={image}
            alt={imageAlt || ''}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content side */}
        <div className={cn(
          "relative z-10 w-full md:w-1/2 flex items-center px-6 md:px-12 py-12 md:py-16",
          isImageLeft ? "md:order-2" : "md:order-1"
        )}>
          <div className="w-full max-w-2xl text-left">
            <h1 className={cn(
              "text-fluid-hero font-heading font-bold mb-4 break-words",
              textColor
            )}>
              {title}
            </h1>
            {subtitle && (
              <p className={cn(
                "text-fluid-subheading mb-4",
                textColorMuted
              )}>
                {subtitle}
              </p>
            )}
            {descriptionContent && descriptionEditor && (
              <div className={cn(
                "text-lg mb-12",
                textColorMuted
              )}>
                <div className={cn(
                  "prose prose-sm",
                  isLightText ? "prose-invert" : ""
                )}>
                  <EditorContent editor={descriptionEditor} />
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-start">
              {ctaText && ctaLink && (
                <Button asChild size="xl" className={buttonPrimaryClass}>
                  <Link href={ctaLink}>{ctaText}</Link>
                </Button>
              )}
              {ctaSecondaryText && ctaSecondaryLink && (
                <Button asChild size="xl" variant="secondary" className={buttonSecondaryClass}>
                  <Link href={ctaSecondaryLink}>{ctaSecondaryText}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render full background layout
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center">
      {image && (
        <div className="absolute inset-0">
          <Image
            src={image}
            alt={imageAlt || ''}
            fill
            className="object-cover"
            priority
          />
          {overlay && (
            <div
              className={cn(
                "absolute inset-0",
                overlayColor === 'white' ? "bg-white" : "bg-black"
              )}
              style={{ opacity: overlayOpacity }}
            />
          )}
        </div>
      )}

      <div className={cn(
        "relative z-10 px-4 w-full",
        isTextLeft ? "text-left" : "text-center"
      )}>
        <div className={cn(
          "max-w-[88rem]",
          isTextLeft ? "" : "mx-auto"
        )}>
          <h1 className={cn(
            "text-fluid-hero font-heading font-bold mb-4 break-words",
            textColor,
            textShadow
          )}>
            {title}
          </h1>
          {subtitle && (
            <p className={cn(
              "text-fluid-subheading mb-4",
              textColorMuted,
              textShadow
            )}>
              {subtitle}
            </p>
          )}
          {descriptionContent && descriptionEditor && (
            <div className={cn(
              "text-lg mb-12",
              textColorMuted,
              textShadow
            )}>
              <div className={cn(
                "prose prose-sm",
                isLightText ? "prose-invert" : ""
              )}>
                <EditorContent editor={descriptionEditor} />
              </div>
            </div>
          )}
          <div className={cn(
            "flex flex-col sm:flex-row gap-4",
            isTextLeft ? "justify-start" : "justify-center"
          )}>
            {ctaText && ctaLink && (
              <Button asChild size="xl" className={buttonPrimaryClass}>
                <Link href={ctaLink}>{ctaText}</Link>
              </Button>
            )}
            {ctaSecondaryText && ctaSecondaryLink && (
              <Button asChild size="xl" variant="secondary" className={buttonSecondaryClass}>
                <Link href={ctaSecondaryLink}>{ctaSecondaryText}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
