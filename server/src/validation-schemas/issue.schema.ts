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

  assignedToId: z.coerce.number().int().positive().nullable().optional(),
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

export const getIssuesQuerySchema = z.object({
  // pagination
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val))
    .refine((val) => val > 0, { message: "Page must be a positive number" }),

  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 100, {
      message: "Limit must be between 1 and 100",
    }),

  // filters
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),

  // search
  search: z
    .string()
    .trim()
    .max(100, "Search term must not exceed 100 characters")
    .optional(),

  // sorting
  sortBy: z
    .enum(["createdAt", "updatedAt", "priority", "status"])
    .optional()
    .default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),

  // filter by assignee
  assignedToMe: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
});

export type GetIssuesQuery = z.infer<typeof getIssuesQuerySchema>;

export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
export type UpdateIssueStatusInput = z.infer<typeof updateIssueStatusSchema>;

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
