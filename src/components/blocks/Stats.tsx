import { StatsBlock } from '@/types/blocks';
import { cn } from '@/lib/utils';

interface StatsProps {
  block: StatsBlock;
}

export function Stats({ block }: StatsProps) {
  const { title, stats } = block;

  return (
    <div>
      {title && (
        <div className="block-header-centered">
          <h2 className="block-title">{title}</h2>
        </div>
      )}
      <div className="block-grid-3">
        {stats.map((stat, index) => (
          <div key={index} className="block-stat">
            <div className="block-stat-value">
              {stat.number}
              {stat.suffix && <span className="text-2xl">{stat.suffix}</span>}
            </div>
            <div className="block-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
