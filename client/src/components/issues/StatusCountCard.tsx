import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { StatusCounts } from '@/types/issue.types';

const CARDS = [
  { key: 'OPEN' as const, label: 'Open', color: 'border-l-blue-500' },
  {
    key: 'IN_PROGRESS' as const,
    label: 'In Progress',
    color: 'border-l-amber-500',
  },
  { key: 'RESOLVED' as const, label: 'Resolved', color: 'border-l-green-500' },
  { key: 'CLOSED' as const, label: 'Closed', color: 'border-l-zinc-400' },
];

interface Props {
  counts: StatusCounts | undefined;
  isLoading: boolean;
  activeStatus: string;
  onFilter: (status: string) => void;
}

export function StatusCountCards({
  counts,
  isLoading,
  activeStatus,
  onFilter,
}: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CARDS.map(({ key, label, color }) => {
        const isActive = activeStatus === key;
        return (
          <button
            key={key}
            onClick={() => onFilter(isActive ? '' : key)}
            className={cn(
              'text-left p-4 rounded-lg border border-l-4 transition-all cursor-pointer',
              color,
              isActive
                ? 'bg-black text-white border-black'
                : 'bg-white hover:bg-zinc-50',
            )}
          >
            <p
              className={cn(
                'text-2xl font-bold',
                isActive ? 'text-white' : 'text-black',
              )}
            >
              {counts?.[key] ?? 0}
            </p>
            <p
              className={cn(
                'text-xs mt-0.5',
                isActive ? 'text-zinc-300' : 'text-zinc-500',
              )}
            >
              {label}
            </p>
          </button>
        );
      })}
    </div>
  );
}
