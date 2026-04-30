import { prisma } from "../client";
import { CreateCommentInput } from "../validation-schemas/comment.schema";

// ----------------------------------------------------------------
// helper — verify issue exists before adding a comment to it
// ----------------------------------------------------------------
const verifyIssueExists = async (issueId: number) => {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    select: { id: true },
  });
  if (!issue) throw new Error("ISSUE_NOT_FOUND");
};

// ----------------------------------------------------------------
// create comment — any authenticated user can comment
// ----------------------------------------------------------------
export const createComment = async (
  issueId: number,
  input: CreateCommentInput,
  userId: number,
) => {
  await verifyIssueExists(issueId);

  const comment = await prisma.comment.create({
    data: {
      body: input.body,
      issueId,
      userId,
    },
    select: {
      id: true,
      body: true,
      createdAt: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return comment;
};

// ----------------------------------------------------------------
// delete comment — only the comment author can delete
// ----------------------------------------------------------------
export const deleteComment = async (
  commentId: number,
  userId: number,
): Promise<void> => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true },
  });

  if (!comment) throw new Error("COMMENT_NOT_FOUND");

  if (comment.userId !== userId) throw new Error("FORBIDDEN");

  await prisma.comment.delete({ where: { id: commentId } });
};
