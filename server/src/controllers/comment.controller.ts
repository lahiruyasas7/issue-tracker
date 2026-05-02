import { Response, Request } from "express";
// import { AuthRequest } from "../middleware/auth.middleware";
import { createComment, deleteComment } from "../Services/comment.service";
import { CreateCommentInput } from "../validation-schemas/comment.schema";

// ----------------------------------------------------------------
// centralized error handler for comment routes
// ----------------------------------------------------------------
const handleCommentError = (err: any, res: Response): void => {
  const message = err.message;

  if (message === "ISSUE_NOT_FOUND") {
    res.status(404).json({ success: false, message: "Issue not found" });
    return;
  }
  if (message === "COMMENT_NOT_FOUND") {
    res.status(404).json({ success: false, message: "Comment not found" });
    return;
  }
  if (message === "FORBIDDEN") {
    res.status(403).json({
      success: false,
      message: "You can only delete your own comments",
    });
    return;
  }

  res.status(500).json({ success: false, message: "Internal server error" });
};

// ----------------------------------------------------------------
// POST /api/issues/:issueId/comments
// ----------------------------------------------------------------
export const createCommentHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { issueId } = req.params;
    if (!issueId || isNaN(Number(issueId))) {
      res.status(400).json({ success: false, message: "Invalid issue ID" });
      return;
    }

    const id = Number(issueId);

    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid issue ID" });
      return;
    }

    const comment = await createComment(id, req.body, req.user!.userId);

    res.status(201).json({
      success: true,
      message: "Comment added",
      data: comment,
    });
  } catch (err: any) {
    handleCommentError(err, res);
  }
};

// ----------------------------------------------------------------
// DELETE /api/comments/:commentId
// ----------------------------------------------------------------
export const deleteCommentHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    if (!commentId || isNaN(Number(commentId))) {
      res.status(400).json({ success: false, message: "Invalid comment ID" });
      return;
    }

    const id = Number(commentId);

    await deleteComment(id, req.user!.userId);

    res.status(204).send();
  } catch (err: any) {
    handleCommentError(err, res);
  }
};
