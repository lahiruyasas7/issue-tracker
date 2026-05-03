import { prisma } from "../client";
import { ALLOWED_TRANSITIONS, PRIORITY_ORDER } from "../config/issue.config";
import { Status } from "../generated/prisma/enums";
import {
  CreateIssueInput,
  GetIssuesQuery,
  UpdateIssueInput,
  UpdateIssueStatusInput,
} from "../validation-schemas/issue.schema";
import { issueSelect } from "../issue.select";
import { Prisma } from "../generated/prisma/client";
import { format as formatCSV } from "@fast-csv/format";
import { Response } from "express";

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
// update issue details (title, description, priority, assignedTo)
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
// used by: updateIssueStatus only
// creator OR assignee is allowed
// ----------------------------------------------------------------
const getIssueForStatusUpdate = async (issueId: number, userId: number) => {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    select: {
      id: true,
      status: true,
      createdById: true,
      assignedToId: true,
    },
  });

  if (!issue) throw new Error("ISSUE_NOT_FOUND");

  const isCreator = issue.createdById === userId;
  const isAssignee = issue.assignedToId === userId;

  if (!isCreator && !isAssignee) throw new Error("FORBIDDEN");

  return issue;
};

// ----------------------------------------------------------------
// update issue status only — separate endpoint, separate logic
// ----------------------------------------------------------------
export const updateIssueStatus = async (
  issueId: number,
  input: UpdateIssueStatusInput,
  userId: number,
) => {
  const issue = await getIssueForStatusUpdate(issueId, userId);

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

export const getIssues = async (query: GetIssuesQuery, userId: number) => {
  const {
    page,
    limit,
    status,
    priority,
    search,
    sortBy,
    sortOrder,
    assignedToMe,
  } = query;

  const skip = (page - 1) * limit;

  // -----------------------------------------------------------
  // Build where clause dynamically
  // Only include filters that were actually provided
  // -----------------------------------------------------------
  const where: Prisma.IssueWhereInput = {
    ...(status && { status }),
    ...(priority && { priority }),
    ...(assignedToMe && { assignedToId: userId }),
    ...(search && {
      title: {
        contains: search,
        // // mysql is case-insensitive by default with utf8 collation
        // // explicitly set mode for safety
        // mode: "insensitive" as Prisma.QueryMode,
      },
    }),
  };

  // -----------------------------------------------------------
  // Build order clause
  // Priority needs special handling — sort by weight not name
  // -----------------------------------------------------------
  let orderBy: Prisma.IssueOrderByWithRelationInput;

  if (sortBy === "priority") {
    // Prisma doesn't support custom enum ordering
    // fall back to raw order using FIELD() MySQL function
    orderBy = { createdAt: sortOrder }; // temp fallback, handled below
  } else {
    orderBy = { [sortBy]: sortOrder };
  }

  // -----------------------------------------------------------
  // Run list query + count query + status counts in parallel
  // -----------------------------------------------------------
  const [issues, totalCount, statusCounts] = await Promise.all([
    prisma.issue.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortBy !== "priority" ? orderBy : undefined,
      select: issueSelect,
    }),

    // total count for pagination meta
    prisma.issue.count({ where }),

    // status counts — always counts ALL issues, ignoring current filters
    // so the dashboard badges always show full counts
    prisma.issue.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  // -----------------------------------------------------------
  // Sort by priority in memory when needed
  // Only applied to the current page — acceptable tradeoff
  // for this scale. For large datasets, use raw SQL FIELD()
  // -----------------------------------------------------------
  let result = issues;
  if (sortBy === "priority") {
    result = [...issues].sort((a, b) => {
      const diff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      return sortOrder === "asc" ? -diff : diff;
    });
  }

  // -----------------------------------------------------------
  // Normalise status counts into a clean object
  // Always return all 4 statuses even if count is 0
  // -----------------------------------------------------------
  const counts = {
    OPEN: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    CLOSED: 0,
  };
  statusCounts.forEach(({ status, _count }) => {
    counts[status] = _count.status;
  });

  // -----------------------------------------------------------
  // Pagination meta
  // -----------------------------------------------------------
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    issues: result,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
    statusCounts: counts,
  };
};

export const getIssueById = async (issueId: number) => {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    select: {
      ...issueSelect,
      comments: {
        select: {
          id: true,
          body: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!issue) throw new Error("ISSUE_NOT_FOUND");

  return issue;
};

//delete issue service
export const deleteIssue = async (
  issueId: number,
  userId: number,
): Promise<void> => {
  // reuses existing helper — checks existence + ownership in one query
  await getIssueOwnedByUser(issueId, userId);

  await prisma.issue.delete({
    where: { id: issueId },
  });
};

// Reuses the same where-clause logic as getIssues
// but fetches ALL matching records — no pagination
const buildWhereClause = (query: Partial<GetIssuesQuery>, userId?: number) => {
  const { status, priority, search, assignedToMe } = query;

  return {
    ...(status && { status }),
    ...(priority && { priority }),

    ...(assignedToMe === true && { assignedToId: userId }),
    ...(search && {
      title: {
        contains: search,
        mode: "insensitive" as const,
      },
    }),
  };
};

export const exportIssues = async (
  query: Partial<GetIssuesQuery>,
  format: "csv" | "json",
  userId: number,
  res: Response,
): Promise<void> => {
  // resolve assignedToMe filter properly
  const where = {
    ...buildWhereClause(query),
    ...(query.assignedToMe === true ? { assignedToId: userId } : {}),
  };

  const issues = await prisma.issue.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,

      createdAt: true,
      updatedAt: true,
      createdBy: {
        select: { name: true, email: true },
      },
      assignedTo: {
        select: { name: true, email: true },
      },
    },
  });

  // Flatten for export — nested objects don't translate well to CSV
  const rows = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    status: issue.status,
    priority: issue.priority,
    created_by: issue.createdBy.name,
    created_by_email: issue.createdBy.email,
    assigned_to: issue.assignedTo?.name ?? "Unassigned",
    assigned_to_email: issue.assignedTo?.email ?? "",
    created_at: issue.createdAt.toISOString(),
    updated_at: issue.updatedAt.toISOString(),
  }));

  // ----------------------------------------------------------------
  // JSON export
  // ----------------------------------------------------------------
  if (format === "json") {
    const filename = `issues-export-${Date.now()}.json`;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).json({
      exported_at: new Date().toISOString(),
      total: rows.length,
      filters_applied: {
        status: query.status ?? null,
        priority: query.priority ?? null,
        search: query.search ?? null,
        assignedToMe: query.assignedToMe ?? false,
      },
      issues: rows,
    });
    return;
  }

  // ----------------------------------------------------------------
  // CSV export — streamed directly to response
  // ----------------------------------------------------------------
  const filename = `issues-export-${Date.now()}.csv`;
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  const csvStream = formatCSV({ headers: true, writeBOM: true });
  csvStream.pipe(res);

  rows.forEach((row) => csvStream.write(row));
  csvStream.end();
};
