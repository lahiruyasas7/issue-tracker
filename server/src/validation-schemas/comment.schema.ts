import { z } from "zod";

export const createCommentSchema = z.object({
  body: z
    .string({ message: "Comment body is required" })
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must not exceed 2000 characters")
    .trim(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
