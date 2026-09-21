/**
 * Esquemas Zod alineados con UsuarioRequestDto / UsuarioUpdateDto del backend.
 */
import { z } from 'zod';

export const MAX_AGE_YEARS = 120;

export function getMaxFechaNacimientoIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getMinFechaNacimientoIso(): string {
  const now = new Date();
  const minYear = now.getFullYear() - MAX_AGE_YEARS;
  return `${minYear}-01-01`;
}

function isNotFuture(value: string): boolean {
  const datePart = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return false;
  return datePart <= getMaxFechaNacimientoIso();
}

function isNotOlderThan120Years(value: string): boolean {
  const datePart = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return false;
  return datePart >= getMinFechaNacimientoIso();
}

const dniSchema = z
  .string()
  .trim()
  .min(1, 'El DNI no puede estar vacío.')
  .regex(/^\d+$/, 'El DNI debe contener solo números.')
  .min(7, 'El DNI debe ser como mínimo de 7 números.')
  .max(8, 'El DNI debe tener como máximo 8 dígitos.');

const fechaNacimientoSchema = z
  .string()
  .min(1, 'La fecha de nacimiento no puede ser vacía.')
  .refine((val) => /^\d{4}-\d{2}-\d{2}(T[\d:.+-]*)?$/.test(val), {
    message: 'La fecha de nacimiento no tiene un formato válido.',
  })
  .refine(isNotFuture, {
    message: 'La fecha de nacimiento no puede exceder la fecha actual ni ser futura.',
  })
  .refine(isNotOlderThan120Years, {
    message: `La fecha de nacimiento no puede ser mayor a ${MAX_AGE_YEARS} años (el año mínimo ingresable es ${new Date().getFullYear() - MAX_AGE_YEARS}).`,
  });

const rolIdSchema = z.coerce
  .number({ error: 'El rol no puede ser nulo' })
  .int('El rol no puede ser nulo')
  .positive('El rol no puede ser nulo');

const categoriaIdSchema = z.coerce
  .number({ error: 'La categoría no puede ser nula.' })
  .int('La categoría no puede ser nula.')
  .positive('La categoría no puede ser nula.');

const usuarioCamposBase = {
  dni: dniSchema,
  nombreCompleto: z
    .string({ error: 'El nombre no puede ser nulo.' })
    .trim()
    .min(1, 'El nombre no puede ser nulo ni estar vacío.')
    .max(100, 'El nombre no puede superar los 100 caracteres.')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, 'El nombre solo puede contener texto (letras y espacios).'),
  email: z
    .string()
    .trim()
    .min(1, 'El email no puede estar vacio')
    .max(120, 'El email no puede superar los 120 caracteres')
    .email('El email no tiene un formato valido'),
  fechaNacimiento: fechaNacimientoSchema,
  estado: z.enum(['ACTIVO', 'DE_BAJA'], {
    error: 'El estado no puede ser nulo.',
  }),
  domicilio: z.string().max(100, 'El domicilio no puede superar los 100 caracteres'),
  rolId: rolIdSchema,
  categoriaId: categoriaIdSchema,
};

/** POST /api/usuarios — UsuarioRequestDto */
export const usuarioRequestSchema = z.object({
  ...usuarioCamposBase,
  passwordHash: z
    .string()
    .min(1, 'La contraseña no puede estar vacía')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

/** PUT /api/usuarios/:id — UsuarioUpdateDto */
export const usuarioUpdateSchema = z.object(usuarioCamposBase);

export type UsuarioRequestFormValues = z.infer<typeof usuarioRequestSchema>;
export type UsuarioUpdateFormValues = z.infer<typeof usuarioUpdateSchema>;
export type UsuarioFormValues = UsuarioRequestFormValues;
