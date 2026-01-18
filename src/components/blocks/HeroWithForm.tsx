import Image from 'next/image';
import { HeroWithFormBlock } from '@/types/blocks';

interface HeroWithFormProps {
  block: HeroWithFormBlock;
}

export function HeroWithForm({ block }: HeroWithFormProps) {
  const { title, subtitle, image, imageAlt, formId, formTitle } = block;

  return (
    <div className="relative min-h-[60vh] flex items-center">
      {image && (
        <div className="absolute inset-0">
          <Image
            src={image}
            alt={imageAlt || ''}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-foreground/50" />
        </div>
      )}

      <div className="relative z-10 w-full">
        <div className="max-w-2xl mx-auto px-4 text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-background/90">
              {subtitle}
            </p>
          )}
        </div>

        {formId && (
          <div className="max-w-md mx-auto px-4">
            <div className="bg-background rounded-lg p-6 shadow-lg">
              {formTitle && (
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  {formTitle}
                </h2>
              )}
              {/* HubSpot form would be embedded here */}
              <div className="text-sm text-muted-foreground">
                Form ID: {formId}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
