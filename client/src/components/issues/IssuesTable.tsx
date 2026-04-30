import { Link, useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { Issue } from '@/types/issue.types';
import { StatusBadge } from '../ui/Statusbadge';
import { PriorityBadge } from '../ui/PrioriryBadge';
import { formatDistanceToNow } from 'date-fns';
import { Pencil } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

interface Props {
  issues: Issue[];
  isLoading: boolean;
}

export function IssueTable({ issues, isLoading }: Props) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg border-dashed border-zinc-200">
        <p className="text-zinc-500 text-sm">No issues found</p>
        <p className="text-zinc-400 text-xs mt-1">
          Try adjusting your filters or create a new issue
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50 hover:bg-zinc-50">
            <TableHead className="font-semibold text-black w-[40%]">
              Issue
            </TableHead>
            <TableHead className="font-semibold text-black">Status</TableHead>
            <TableHead className="font-semibold text-black">Priority</TableHead>
            <TableHead className="font-semibold text-black hidden md:table-cell">
              Assignee
            </TableHead>
            <TableHead className="font-semibold text-black hidden lg:table-cell">
              Created
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow
              key={issue.id}
              onClick={() => navigate(`/issues/${issue.id}`)}
              className="cursor-pointer hover:bg-zinc-50 transition-colors"
            >
              {/* Title + ID */}
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-black text-sm leading-snug">
                    {issue.title}
                  </span>
                  <span className="text-xs text-zinc-400">
                    #{issue.id} · {issue.createdBy.name}
                  </span>
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <StatusBadge status={issue.status} />
              </TableCell>

              {/* Priority */}
              <TableCell>
                <PriorityBadge priority={issue.priority} />
              </TableCell>

              {/* Assignee */}
              <TableCell className="hidden md:table-cell">
                {issue.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium">
                      {issue.assignedTo.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-zinc-600">
                      {issue.assignedTo.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-zinc-400">Unassigned</span>
                )}
              </TableCell>

              {/* Created at */}
              <TableCell className="hidden lg:table-cell text-sm text-zinc-500">
                {formatDistanceToNow(new Date(issue.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="w-10">
                {user?.id === issue.createdBy.id && (
                  <Link
                    to={`/issues/${issue.id}/edit`}
                    onClick={(e) => e.stopPropagation()} // prevent row click nav
                    className="p-1.5 rounded hover:bg-zinc-100 text-zinc-400
               hover:text-black transition-colors inline-flex"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
