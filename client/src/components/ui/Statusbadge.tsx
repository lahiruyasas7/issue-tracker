import { STATUS_CONFIG } from '@/config/issue.config';
import { cn } from '@/lib/utils';
import type { IssueStatus } from '@/types/issue.types';

interface Props {
  status: IssueStatus;
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
