import { cn } from '@/lib/utils';

interface Props {
  current: number;
  max: number;
}

export function CharCounter({ current, max }: Props) {
  const isNearLimit = current > max * 0.85;
  const isOverLimit = current > max;

  return (
    <span
      className={cn(
        'text-xs tabular-nums',
        isOverLimit
          ? 'text-red-500'
          : isNearLimit
            ? 'text-amber-500'
            : 'text-zinc-400',
      )}
    >
      {current}/{max}
    </span>
  );
}
