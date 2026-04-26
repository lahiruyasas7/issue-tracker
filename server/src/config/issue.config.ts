import { Status } from "../generated/prisma/client";

// Defines which status transitions are legally allowed
// Prevents jumping from OPEN directly to CLOSED
export const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["OPEN", "RESOLVED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"], // can reopen to IN_PROGRESS if needed
  CLOSED: [], // terminal state — no transitions allowed
};
