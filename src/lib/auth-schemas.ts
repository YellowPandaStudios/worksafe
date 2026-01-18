import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Ogiltig e-postadress'),
  password: z.string().min(8, 'Lösenordet måste vara minst 8 tecken'),
});

export const signUpSchema = z.object({
  name: z.string().min(2, 'Namnet måste vara minst 2 tecken'),
  email: z.string().email('Ogiltig e-postadress'),
  password: z.string().min(8, 'Lösenordet måste vara minst 8 tecken'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
