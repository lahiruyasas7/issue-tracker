import { Response, Request } from "express";
import {
  createIssue,
  deleteIssue,
  exportIssues,
  getIssueById,
  getIssues,
  updateIssue,
  updateIssueStatus,
} from "../Services/issue.service";
import {
  ExportIssuesQuery,
  exportIssuesQuerySchema,
  GetIssuesQuery,
} from "../validation-schemas/issue.schema";

export const createIssueHandler = async (
  req: Request,
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
  req: Request,
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
  req: Request,
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

export const getIssuesHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const query = (req as any).validated.query as GetIssuesQuery;
    const result = await getIssues(query, req.user!.userId);

    res.status(200).json({
      success: true,
      data: result.issues,
      pagination: result.pagination,
      statusCounts: result.statusCounts,
    });
  } catch (err: any) {
    handleIssueError(err, res);
  }
};

export const getIssueByIdHandler = async (
  req: Request,
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

    const issue = await getIssueById(issueId);

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (err: any) {
    handleIssueError(err, res);
  }
};

export const deleteIssueHandler = async (
  req: Request,
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

    await deleteIssue(issueId, req.user!.userId);

    res.status(204).send();
  } catch (err: any) {
    handleIssueError(err, res);
  }
};

export const exportIssuesHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const query = req.query as unknown as ExportIssuesQuery;

    const format = (query.format ?? "csv") as "csv" | "json";

    await exportIssues(query, format, req.user!.userId, res);
  } catch (err: any) {
    // only send error headers if response hasn't started streaming yet
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Export failed",
      });
    }
  }
};
