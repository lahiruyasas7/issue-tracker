import { Status } from "../generated/prisma/client";

// Defines which status transitions are legally allowed
// Prevents jumping from OPEN directly to CLOSED
export const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["OPEN", "RESOLVED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"], // can reopen to IN_PROGRESS if needed
  CLOSED: [], // terminal state — no transitions allowed
};

// Prisma doesn't support enum-based sort order natively
// We map priority to a numeric weight for correct sorting
export const PRIORITY_ORDER: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};
