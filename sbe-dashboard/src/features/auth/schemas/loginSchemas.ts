import { z } from 'zod';

const dniSchema = z
  .string()
  .trim()
  .min(1, 'El DNI no puede estar vacío.')
  .regex(/^\d+$/, 'El DNI debe contener solo números.')
  .min(7, 'El DNI debe ser como mínimo de 7 números.')
  .max(8, 'El DNI debe tener como máximo 8 dígitos.');

const passwordSchema = z
  .string()
  .min(1, 'La contraseña no puede estar vacía.');

export const loginSchema = z.object({
  dni: dniSchema,
  password: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;