import { z } from 'zod';

export const PinLoginSchema = z.object({
  venueId: z.string().min(1),
  userId: z.string().min(1),
  pin: z.string().min(4).max(6).regex(/^\d+$/, 'PIN must be 4 to 6 digits'),
  deviceId: z.string().optional(),
});

export type PinLoginInput = z.infer<typeof PinLoginSchema>;

export const PasswordLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  deviceId: z.string().optional(),
});

export type PasswordLoginInput = z.infer<typeof PasswordLoginSchema>;

export const ManagerPinOverrideSchema = z.object({
  venueId: z.string().uuid(),
  managerPin: z.string().min(4).max(6).regex(/^\d+$/),
  action: z.string(),
  reason: z.string().min(3),
});

export type ManagerPinOverrideInput = z.infer<typeof ManagerPinOverrideSchema>;
