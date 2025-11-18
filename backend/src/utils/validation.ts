import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const generationSchema = z.object({
  prompt: z.string().min(3, 'Prompt must be at least 3 characters').max(500),
  style: z.enum(['casual', 'formal', 'streetwear', 'vintage', 'modern']),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GenerationInput = z.infer<typeof generationSchema>;
