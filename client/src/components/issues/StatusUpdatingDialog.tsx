import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { IssueStatus } from '@/types/issue.types';
import { Loader2 } from 'lucide-react';
import { StatusBadge } from '../ui/Statusbadge';

interface Props {
  open: boolean;
  targetStatus: IssueStatus | null;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function StatusUpdateDialog({
  open,
  targetStatus,
  isPending,
  onConfirm,
  onCancel,
}: Props) {
  if (!targetStatus) return null;

  const isClose = targetStatus === 'CLOSED';
  const isResolve = targetStatus === 'RESOLVED';

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isClose
              ? 'Close this issue?'
              : isResolve
                ? 'Mark as resolved?'
                : 'Confirm status change'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                {isClose
                  ? 'Closing this issue marks it as complete and no further action is needed. This can be reopened later if required.'
                  : isResolve
                    ? 'Marking as resolved means the fix has been applied and verified. The issue can be reopened if the problem persists.'
                    : `The issue status will be changed to:`}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">New status:</span>
                <StatusBadge status={targetStatus} />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-black text-white hover:bg-zinc-800 min-w-[100px]"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </span>
            ) : isClose ? (
              'Close issue'
            ) : isResolve ? (
              'Mark resolved'
            ) : (
              'Confirm'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
