import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createIssue,
  updateIssue,
  updateIssueStatus,
} from "../Services/issue.service";

export const createIssueHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const issue = await createIssue(req.body, req.user!.userId);

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  } catch (err: any) {
    if (err.message === "Assigned user does not exist") {
      res.status(400).json({ success: false, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateIssueHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid issue ID" });
      return;
    }

    const issueId = Number(id);

    if (isNaN(issueId)) {
      res.status(400).json({ success: false, message: "Invalid issue ID" });
      return;
    }

    const issue = await updateIssue(issueId, req.body, req.user!.userId);

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: issue,
    });
  } catch (err: any) {
    handleIssueError(err, res);
  }
};

export const updateIssueStatusHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid issue ID" });
      return;
    }

    const issueId = Number(id);

    if (isNaN(issueId)) {
      res.status(400).json({ success: false, message: "Invalid issue ID" });
      return;
    }

    const issue = await updateIssueStatus(issueId, req.body, req.user!.userId);

    res.status(200).json({
      success: true,
      message: `Issue marked as ${issue.status.toLowerCase().replace("_", " ")}`,
      data: issue,
    });
  } catch (err: any) {
    handleIssueError(err, res);
  }
};

// ----------------------------------------------------------------
// centralised error handler for issue routes
// keeps controllers clean and error messages consistent
// ----------------------------------------------------------------
const handleIssueError = (err: any, res: Response): void => {
  const message = err.message;

  if (message === "ISSUE_NOT_FOUND") {
    res.status(404).json({ success: false, message: "Issue not found" });
    return;
  }
  if (message === "FORBIDDEN") {
    res
      .status(403)
      .json({ success: false, message: "You can only update your own issues" });
    return;
  }
  if (message === "ASSIGNEE_NOT_FOUND") {
    res
      .status(400)
      .json({ success: false, message: "Assigned user does not exist" });
    return;
  }
  if (message === "SAME_STATUS") {
    res
      .status(400)
      .json({ success: false, message: "Issue is already in that status" });
    return;
  }
  if (message?.startsWith("INVALID_TRANSITION")) {
    const [, from, to] = message.split(":");
    res.status(400).json({
      success: false,
      message: `Cannot transition from ${from} to ${to}`,
    });
    return;
  }

  res.status(500).json({ success: false, message: "Internal server error" });
};
