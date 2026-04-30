import { useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/ui/Statusbadge';
import { PriorityBadge } from '@/components/ui/PrioriryBadge';
import { MetaRow, UserAvatar } from '@/components/issues/IssueMeta';
import { CommentsSection } from '@/components/issues/CommentSection';
import { StatusUpdateDialog } from '@/components/issues/StatusUpdatingDialog';
import { DeleteIssueDialog } from '@/components/issues/DeleteIssueDialog';
// import { useAuth } from '@/context/AuthContext';
import {
  ALLOWED_TRANSITIONS,
  CONFIRMATION_REQUIRED,
  STATUS_TRANSITION_LABELS,
} from '@/config/issue.config';
import type { Issue, IssueStatus } from '@/types/issue.types';
import {
  ChevronLeft,
  Pencil,
  Trash2,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { issueService } from '@/api/issue.api';
import { useAuthStore } from '@/store/auth.store';

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const issueId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  // const { user: currentUser } = useAuth();

  // guard non-numeric id
  if (!id || isNaN(issueId)) return <Navigate to="/issues" replace />;

  // ----------------------------------------------------------------
  // Dialog state
  // ----------------------------------------------------------------
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    targetStatus: IssueStatus | null;
  }>({ open: false, targetStatus: null });

  const [deleteDialog, setDeleteDialog] = useState(false);

  // ----------------------------------------------------------------
  // Fetch issue
  // ----------------------------------------------------------------
  const { data, isLoading, isError } = useQuery<{ data: Issue }>({
    queryKey: ['issue', issueId],
    queryFn: () => issueService.getById(issueId),
  });

  const issue = data?.data;
  console.log('Fetched issue:', issue);
  // ----------------------------------------------------------------
  // Status update mutation
  // ----------------------------------------------------------------
  const statusMutation = useMutation({
    mutationFn: (targetStatus: IssueStatus) => {
      const needsConfirmation = CONFIRMATION_REQUIRED.includes(targetStatus);
      return issueService.updateStatus(issueId, {
        status: targetStatus,
        confirmation: needsConfirmation ? true : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
      setStatusDialog({ open: false, targetStatus: null });
    },
    onError: () => {
      setStatusDialog({ open: false, targetStatus: null });
    },
  });

  // ----------------------------------------------------------------
  // Delete mutation
  // ----------------------------------------------------------------
  const deleteMutation = useMutation({
    mutationFn: () => issueService.delete(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      navigate('/issues', { replace: true });
    },
    onError: () => {
      setDeleteDialog(false);
    },
  });

  // ----------------------------------------------------------------
  // Derived state
  // ----------------------------------------------------------------
  const isOwner = !!(
    currentUser &&
    issue &&
    currentUser.id === issue.createdBy.id
  );

  const availableTransitions = issue ? ALLOWED_TRANSITIONS[issue.status] : [];

  // ----------------------------------------------------------------
  // Status change handler
  // needs confirmation dialog for RESOLVED / CLOSED
  // proceeds directly for other transitions
  // ----------------------------------------------------------------
  const handleStatusSelect = (targetStatus: IssueStatus) => {
    if (CONFIRMATION_REQUIRED.includes(targetStatus)) {
      setStatusDialog({ open: true, targetStatus });
    } else {
      statusMutation.mutate(targetStatus);
    }
  };

  // ----------------------------------------------------------------
  // Loading skeleton
  // ----------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-36 w-full" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Error state
  // ----------------------------------------------------------------
  if (isError || !issue) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link
          to="/issues"
          className="inline-flex items-center gap-1.5 text-sm
                     text-zinc-500 hover:text-black mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to issues
        </Link>
        <div
          className="flex items-center gap-3 p-4 rounded-lg border
                        border-red-200 bg-red-50 text-red-700 text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {isError ? 'Failed to load issue.' : 'Issue not found.'}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Breadcrumb */}
        <Link
          to="/issues"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500
                     hover:text-black transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to issues
        </Link>

        {/* Main grid — content left, sidebar right */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          {/* ── Left column ── */}
          <div className="space-y-6 min-w-0">
            {/* Issue header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold text-black leading-snug">
                  {issue.title}
                </h1>

                {/* Owner actions */}
                {isOwner && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/issues/${issueId}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-zinc-200 hover:bg-zinc-50 gap-1.5"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDialog(true)}
                      className="border-red-200 text-red-600 hover:bg-red-50
                                 hover:text-red-700 gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* Status + Priority badges + issue ID */}
              <div className="flex items-center flex-wrap gap-2">
                <StatusBadge status={issue.status} />
                <PriorityBadge priority={issue.priority} />
                {/* {issue.severity && (
                  <span
                    className="inline-flex items-center px-2.5 py-0.5
                                   rounded-full text-xs font-medium border
                                   bg-zinc-100 text-zinc-600 border-zinc-200"
                  >
                    {issue.severity.charAt(0) +
                      issue.severity.slice(1).toLowerCase()}{' '}
                    severity
                  </span>
                )} */}
                <span className="text-xs text-zinc-400 ml-1">#{issue.id}</span>
              </div>

              {/* Status transition — only for owner, only if transitions exist */}
              {isOwner && availableTransitions.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-zinc-400">Move to:</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={statusMutation.isPending}
                        className="border-zinc-200 hover:bg-zinc-50 gap-1.5
                                   text-sm h-8"
                      >
                        Change status
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuLabel className="text-xs text-zinc-400">
                        Available transitions
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {availableTransitions.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => handleStatusSelect(status)}
                          className="gap-2 cursor-pointer"
                        >
                          <StatusBadge status={status} />
                          <span className="text-sm">
                            {STATUS_TRANSITION_LABELS[status]}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Closed terminal state notice */}
              {issue.status === 'CLOSED' && (
                <p className="text-xs text-zinc-400 italic">
                  This issue is closed and cannot be transitioned further.
                </p>
              )}
            </div>

            <Separator className="bg-zinc-100" />

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-black">Description</h2>
              <p
                className="text-sm text-zinc-700 leading-relaxed
                            whitespace-pre-wrap"
              >
                {issue.description}
              </p>
            </div>

            <Separator className="bg-zinc-100" />

            {/* Comments */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-black">
                Comments
                {issue.comments?.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-zinc-400">
                    {issue.comments.length}
                  </span>
                )}
              </h2>
              <CommentsSection
                comments={issue.comments ?? []}
                issueId={issueId}
              />
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <aside className="space-y-6">
            <div
              className="bg-zinc-50 border border-zinc-200 rounded-xl
                            p-5 space-y-5"
            >
              <MetaRow label="Status">
                <StatusBadge status={issue.status} />
              </MetaRow>

              <Separator className="bg-zinc-200" />

              <MetaRow label="Priority">
                <PriorityBadge priority={issue.priority} />
              </MetaRow>

              {/* {issue.severity && (
                <>
                  <Separator className="bg-zinc-200" />
                  <MetaRow label="Severity">
                    <span className="text-sm text-zinc-700">
                      {issue.severity.charAt(0) +
                        issue.severity.slice(1).toLowerCase()}
                    </span>
                  </MetaRow>
                </>
              )} */}

              <Separator className="bg-zinc-200" />

              <MetaRow label="Created by">
                <UserAvatar
                  name={issue.createdBy.name}
                  email={issue.createdBy.email}
                />
              </MetaRow>

              <Separator className="bg-zinc-200" />

              <MetaRow label="Assigned to">
                {issue.assignedTo ? (
                  <UserAvatar
                    name={issue.assignedTo.name}
                    email={issue.assignedTo.email}
                  />
                ) : (
                  <span className="text-sm text-zinc-400">Unassigned</span>
                )}
              </MetaRow>

              <Separator className="bg-zinc-200" />

              <MetaRow label="Created">
                <span className="text-sm text-zinc-600">
                  {format(new Date(issue.createdAt), 'MMM d, yyyy')}
                </span>
                <span className="text-xs text-zinc-400 block mt-0.5">
                  {format(new Date(issue.createdAt), 'h:mm a')}
                </span>
              </MetaRow>

              <Separator className="bg-zinc-200" />

              <MetaRow label="Last updated">
                <span className="text-sm text-zinc-600">
                  {format(new Date(issue.updatedAt), 'MMM d, yyyy')}
                </span>
                <span className="text-xs text-zinc-400 block mt-0.5">
                  {format(new Date(issue.updatedAt), 'h:mm a')}
                </span>
              </MetaRow>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Dialogs (outside grid, always mounted) ── */}
      <StatusUpdateDialog
        open={statusDialog.open}
        targetStatus={statusDialog.targetStatus}
        isPending={statusMutation.isPending}
        onConfirm={() => {
          if (statusDialog.targetStatus) {
            statusMutation.mutate(statusDialog.targetStatus);
          }
        }}
        onCancel={() => setStatusDialog({ open: false, targetStatus: null })}
      />

      <DeleteIssueDialog
        open={deleteDialog}
        title={issue?.title ?? ''}
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteDialog(false)}
      />
    </>
  );
}
