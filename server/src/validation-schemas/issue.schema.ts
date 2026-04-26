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

export const updateIssueSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: "Title must be at least 3 characters" })
      .max(150, { message: "Title must not exceed 150 characters" })
      .trim()
      .optional(),

    description: z
      .string()
      .min(10, { message: "Description must be at least 10 characters" })
      .trim()
      .optional(),

    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),

    severity: z.enum(["MINOR", "MAJOR", "CRITICAL"]).nullable().optional(),

    assignedToId: z.coerce
      .number() // handles string → number
      .int()
      .positive()
      .nullable()
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export const updateIssueStatusSchema = z
  .object({
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),

    confirmation: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.status === "RESOLVED" || data.status === "CLOSED") {
        return data.confirmation === true;
      }
      return true;
    },
    {
      message: "You must confirm before marking an issue as Resolved or Closed",
      path: ["confirmation"],
    },
  );

export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
export type UpdateIssueStatusInput = z.infer<typeof updateIssueStatusSchema>;

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
