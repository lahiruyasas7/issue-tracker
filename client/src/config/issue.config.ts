import type { IssuePriority, IssueStatus } from '@/types/issue.types';

export const STATUS_CONFIG: Record<
  IssueStatus,
  { label: string; className: string }
> = {
  OPEN: {
    label: 'Open',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  },
};

export const PRIORITY_CONFIG: Record<
  IssuePriority,
  { label: string; className: string; dotClass: string }
> = {
  CRITICAL: {
    label: 'Critical',
    className: 'bg-red-100 text-red-800 border-red-200',
    dotClass: 'bg-red-500',
  },
  HIGH: {
    label: 'High',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    dotClass: 'bg-orange-500',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dotClass: 'bg-yellow-500',
  },
  LOW: {
    label: 'Low',
    className: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    dotClass: 'bg-zinc-400',
  },
};
