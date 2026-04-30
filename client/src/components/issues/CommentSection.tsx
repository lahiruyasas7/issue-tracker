// import type { Comment } from '@/types/comment.type';
// import { formatDistanceToNow } from 'date-fns';

// interface Props {
//   comments: Comment[];
// }

// export function CommentsSection({ comments }: Props) {
//   if (comments.length === 0) {
//     return (
//       <div
//         className="text-center py-8 border border-dashed border-zinc-200
//                       rounded-lg"
//       >
//         <p className="text-sm text-zinc-400">No comments yet</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {comments.map((comment) => (
//         <div key={comment.id} className="flex gap-3">
//           {/* Avatar */}
//           <div
//             className="w-8 h-8 rounded-full bg-black text-white flex
//                           items-center justify-center text-xs font-medium shrink-0 mt-0.5"
//           >
//             {comment.user.name.charAt(0).toUpperCase()}
//           </div>

//           {/* Body */}
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2 mb-1">
//               <span className="text-sm font-medium text-black">
//                 {comment.user.name}
//               </span>
//               <span className="text-xs text-zinc-400">
//                 {formatDistanceToNow(new Date(comment.createdAt), {
//                   addSuffix: true,
//                 })}
//               </span>
//             </div>
//             <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
//               {comment.body}
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
import { CharCounter } from '@/components/ui/CharCounter';
import { Trash2, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  commentSchema,
  type CommentFormValues,
} from '@/validations-schema/issue.schema';
import { issueService } from '@/api/issue.api';
import type { Comment } from '@/types/comment.type';

interface Props {
  issueId: number;
  comments: Comment[];
}

export function CommentsSection({ issueId, comments }: Props) {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  console.log('comments', comments);
  // ----------------------------------------------------------------
  // Comment form
  // ----------------------------------------------------------------
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: '' },
  });

  const bodyValue = watch('body') ?? '';

  // ----------------------------------------------------------------
  // Add comment mutation
  // ----------------------------------------------------------------
  const addMutation = useMutation({
    mutationFn: (values: CommentFormValues) =>
      issueService.addComment(issueId, values.body),
    onSuccess: () => {
      reset();
      // invalidate so the issue detail refetches with new comment
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
      // scroll to bottom after render
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
  });

  // ----------------------------------------------------------------
  // Delete comment mutation
  // ----------------------------------------------------------------
  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => issueService.deleteComment(commentId),
    onSuccess: () => {
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
    },
    onError: () => {
      setDeleteTarget(null);
    },
  });

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  return (
    <>
      <div className="space-y-6">
        {/* Comment count header */}
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-semibold text-black">
            {comments.length === 0
              ? 'No comments'
              : `${comments.length} comment${comments.length > 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Comment list */}
        {comments.length > 0 && (
          <div className="space-y-5">
            {comments.map((comment) => {
              const isAuthor = currentUser?.id === comment.user.id;
              return (
                <div key={comment.id} className="flex gap-3 group">
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full bg-black text-white
                                  flex items-center justify-center text-xs
                                  font-medium shrink-0 mt-0.5"
                  >
                    {comment.user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Comment body */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="bg-zinc-50 border border-zinc-200
                                    rounded-lg px-4 py-3 relative"
                    >
                      {/* Header */}
                      <div
                        className="flex items-center justify-between
                                      gap-2 mb-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-black">
                            {comment.user.name}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>

                        {/* Delete — only visible to comment author */}
                        {isAuthor && (
                          <button
                            onClick={() => setDeleteTarget(comment.id)}
                            className={cn(
                              'p-1 rounded text-zinc-300 hover:text-red-500',
                              'hover:bg-red-50 transition-colors',
                              'opacity-0 group-hover:opacity-100',
                            )}
                            aria-label="Delete comment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Body */}
                      <p
                        className="text-sm text-zinc-700 whitespace-pre-wrap
                                    leading-relaxed"
                      >
                        {comment.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* scroll anchor */}
            <div ref={bottomRef} />
          </div>
        )}

        {/* ── Add comment form ── */}
        <form
          onSubmit={handleSubmit((values) => addMutation.mutate(values))}
          noValidate
        >
          <div className="flex gap-3">
            {/* Current user avatar */}
            <div
              className="w-8 h-8 rounded-full bg-black text-white
                            flex items-center justify-center text-xs
                            font-medium shrink-0 mt-0.5"
            >
              {currentUser?.name.charAt(0).toUpperCase() ?? '?'}
            </div>

            {/* Input + submit */}
            <div className="flex-1 space-y-2">
              <div className="relative">
                <Textarea
                  {...register('body')}
                  placeholder="Leave a comment..."
                  rows={3}
                  disabled={addMutation.isPending}
                  className={cn(
                    'resize-none border-zinc-200 focus-visible:ring-black',
                    'text-sm pb-7',
                    errors.body && 'border-red-300 focus-visible:ring-red-400',
                  )}
                />
                {/* Char counter inside textarea */}
                <div className="absolute right-3 bottom-2.5">
                  <CharCounter current={bodyValue.length} max={2000} />
                </div>
              </div>

              {/* Validation error */}
              {errors.body && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span
                    className="w-1 h-1 rounded-full bg-red-500 shrink-0
                                   inline-block"
                  />
                  {errors.body.message}
                </p>
              )}

              {/* Server error */}
              {addMutation.isError && (
                <p className="text-xs text-red-500">
                  Failed to post comment. Please try again.
                </p>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    addMutation.isPending || bodyValue.trim().length === 0
                  }
                  className="bg-black text-white hover:bg-zinc-800 min-w-[120px]"
                >
                  {addMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Posting...
                    </span>
                  ) : (
                    'Post comment'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteTarget !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget !== null) {
                  deleteMutation.mutate(deleteTarget);
                }
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700 min-w-[100px]"
            >
              {deleteMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
