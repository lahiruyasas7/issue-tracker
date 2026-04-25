import { z } from "zod";

export const createIssueSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(150, { message: "Title must not exceed 150 characters" })
    .trim(),

  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .trim(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),

  assignedToId: z.coerce.number().int().positive().optional(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
