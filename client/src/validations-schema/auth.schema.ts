import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(50)
  .regex(/[a-z]/, 'Must include lowercase')
  .regex(/[A-Z]/, 'Must include uppercase')
  .regex(/[0-9]/, 'Must include number')
  .regex(/[@$!%*?&#]/, 'Must include special character');

export const loginSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
});

export const signupSchema = z
  .object({
    full_name: z.string().min(1),
    email: z.string().email(),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
