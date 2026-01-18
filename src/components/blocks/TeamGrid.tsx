import Image from 'next/image';
import Link from 'next/link';
import { TeamGridBlock } from '@/types/blocks';
import { Mail, Linkedin } from 'lucide-react';

interface TeamGridProps {
  block: TeamGridBlock;
}

export function TeamGrid({ block }: TeamGridProps) {
  const { title, subtitle, members } = block;

  return (
    <div>
      {title && (
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
      )}
      {subtitle && (
        <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map((member, index) => (
          <div key={index} className="text-center">
            {member.image && (
              <div className="relative aspect-square w-32 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.imageAlt || member.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
            <p className="text-muted-foreground mb-4">{member.role}</p>
            <div className="flex gap-4 justify-center">
              {member.email && (
                <a href={`mailto:${member.email}`} className="text-muted-foreground hover:text-primary">
                  <Mail className="h-5 w-5" />
                </a>
              )}
              {member.linkedin && (
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
