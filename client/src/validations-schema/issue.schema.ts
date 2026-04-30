import { z } from 'zod';

export const issueFormSchema = z.object({
  title: z
    .string({ message: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(150, 'Title must not exceed 150 characters')
    .trim(),

  description: z
    .string({ message: 'Description is required' })
    .min(10, 'Description must be at least 10 characters')
    .trim(),

  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .default('MEDIUM')
    .optional(),

  assignedToId: z.number().int().positive().optional().nullable(),
});

export type IssueFormValues = z.input<typeof issueFormSchema>;

export const commentSchema = z.object({
  body: z
    .string({ message: 'Comment cannot be empty' })
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must not exceed 2000 characters')
    .trim(),
});

export type CommentFormValues = z.infer<typeof commentSchema>;
