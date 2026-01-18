import Image from 'next/image';
import Link from 'next/link';
import { LogoGridBlock } from '@/types/blocks';
import { cn } from '@/lib/utils';

interface LogoGridProps {
  block: LogoGridBlock;
}

export function LogoGrid({ block }: LogoGridProps) {
  const { title, subtitle, logos, grayscale } = block;

  return (
    <div>
      {title && (
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
      )}
      {subtitle && (
        <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
        {logos.map((logo, index) => {
          const content = (
            <div className="relative aspect-video">
              <Image
                src={logo.image}
                alt={logo.alt}
                fill
                className={cn('object-contain', grayscale && 'grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all')}
              />
            </div>
          );

          return logo.link ? (
            <Link key={index} href={logo.link} className="flex items-center justify-center">
              {content}
            </Link>
          ) : (
            <div key={index} className="flex items-center justify-center">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
