import { PRIORITY_CONFIG } from '@/config/issue.config';
import { cn } from '@/lib/utils';
import type { IssuePriority } from '@/types/issue.types';

interface Props {
  priority: IssuePriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: Props) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  );
}
