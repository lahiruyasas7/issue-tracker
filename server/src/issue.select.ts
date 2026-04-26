// Single source of truth for what issue fields to return in responses
// Reused across create, update, getById, getAll — keeps responses consistent
export const issueSelect = {
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
} as const;
