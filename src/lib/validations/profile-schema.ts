import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  timezone: z.string().min(1, 'Timezone is required'),
  language: z.string().min(1, 'Language is required'),
  bio: z.string().max(200, 'Bio must be less than 200 characters').optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
