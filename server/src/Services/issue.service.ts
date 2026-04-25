import { prisma } from "../client";
import { CreateIssueInput } from "../validation-schemas/issue.schema";

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
