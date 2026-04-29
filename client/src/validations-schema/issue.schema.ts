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

  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM').optional(),

  assignedToId: z.number().int().positive().optional().nullable(),
});

export type IssueFormValues = z.input<typeof issueFormSchema>;
