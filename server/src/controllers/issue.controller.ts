import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { createIssue } from "../Services/issue.service";

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
