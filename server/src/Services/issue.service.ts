import { prisma } from "../client";
import { ALLOWED_TRANSITIONS } from "../config/issue.config";
import { Status } from "../generated/prisma/enums";
import {
  CreateIssueInput,
  UpdateIssueInput,
  UpdateIssueStatusInput,
} from "../validation-schemas/issue.schema";
import { issueSelect } from "../issue.select";

export const createIssue = async (
  input: CreateIssueInput,
  createdById: number,
) => {
  const { title, description, priority, assignedToId } = input;

  // If assignedToId provided, verify that user actually exists
  if (assignedToId) {
    const assignee = await prisma.user.findUnique({
      where: { id: assignedToId },
      select: { id: true },
    });
    if (!assignee) {
      throw new Error("Assigned user does not exist");
    }
  }

  const issue = await prisma.issue.create({
    data: {
      title,
      description,
      priority: priority ?? "MEDIUM",
      assignedToId: assignedToId ?? null,
      createdById,
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      createdAt: true,
      updatedAt: true,
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return issue;
};

// ----------------------------------------------------------------
// helper — fetch issue and verify ownership in one place
// reused by both update functions below
// ----------------------------------------------------------------
const getIssueOwnedByUser = async (issueId: number, userId: number) => {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    select: { id: true, status: true, createdById: true },
  });

  if (!issue) {
    throw new Error("ISSUE_NOT_FOUND");
  }

  if (issue.createdById !== userId) {
    throw new Error("FORBIDDEN");
  }

  return issue;
};

// ----------------------------------------------------------------
// update issue details (title, description, priority, severity, assignedTo)
// ----------------------------------------------------------------
export const updateIssue = async (
  issueId: number,
  input: UpdateIssueInput,
  userId: number,
) => {
  await getIssueOwnedByUser(issueId, userId);

  const { assignedToId, ...rest } = input;

  // If assignedToId is explicitly being changed, verify the new assignee exists
  if (assignedToId !== undefined && assignedToId !== null) {
    const assignee = await prisma.user.findUnique({
      where: { id: assignedToId },
      select: { id: true },
    });
    if (!assignee) {
      throw new Error("ASSIGNEE_NOT_FOUND");
    }
  }

  const updated = await prisma.issue.update({
    where: { id: issueId },
    data: {
      ...rest,
      // handle null explicitly to allow unassigning
      ...(assignedToId !== undefined && { assignedToId }),
    },
    select: issueSelect,
  });

  return updated;
};

// ----------------------------------------------------------------
// update issue status only — separate endpoint, separate logic
// ----------------------------------------------------------------
export const updateIssueStatus = async (
  issueId: number,
  input: UpdateIssueStatusInput,
  userId: number,
) => {
  const issue = await getIssueOwnedByUser(issueId, userId);

  const currentStatus = issue.status as Status;
  const newStatus = input.status as Status;

  // No-op check — already in the requested status
  if (currentStatus === newStatus) {
    throw new Error("SAME_STATUS");
  }

  // Enforce transition rules
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed.includes(newStatus)) {
    throw new Error(`INVALID_TRANSITION:${currentStatus}:${newStatus}`);
  }

  const updated = await prisma.issue.update({
    where: { id: issueId },
    data: { status: newStatus },
    select: issueSelect,
  });

  return updated;
};
