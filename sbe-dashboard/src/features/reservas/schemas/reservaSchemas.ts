/**
 * reservaSchemas.ts
 * Esquemas Zod alineados con ReservaRequestDto y ReprogramarReservaRequestDto del backend.
 */
import { z } from 'zod';

/**
 * Calcula la fecha máxima permitida (hoy + 2 meses) en formato "YYYY-MM-DD" local.
 */
export function calcMax2Months(): Date {
  const d = new Date();
  const currentDay = d.getDate();
  d.setMonth(d.getMonth() + 2);
  if (d.getDate() !== currentDay) {
    d.setDate(0);
  }
  return d;
}

export function getMax2MonthsISO(): string {
  const d = calcMax2Months();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const fechaReservaSchema = z
  .string()
  .min(1, 'La fecha de reserva es obligatoria.')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD).')
  .refine((val) => val <= getMax2MonthsISO(), {
    message: 'La reserva no puede realizarse con más de 2 meses de anticipación.',
  });

const horarioSchema = z
  .string()
  .min(1, 'El horario es obligatorio.')
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato de hora inválido (HH:mm).');

/**
 * Esquema para POST /api/reservas (ReservaRequestDto)
 */
export const reservaRequestSchema = z.object({
  fechaReserva: fechaReservaSchema,
  horarioInicio: horarioSchema,
  horarioFin: horarioSchema,
  idUsuario: z.coerce
    .number({ error: 'Debe seleccionar un usuario.' })
    .int('Debe seleccionar un usuario válido.')
    .positive('Debe seleccionar un usuario.'),
  idInstalacion: z.coerce
    .number({ error: 'Debe seleccionar una instalación.' })
    .int('Debe seleccionar una instalación válida.')
    .positive('Debe seleccionar una instalación.'),
});

/**
 * Esquema para PUT /api/reservas/:id/reprogramar (ReprogramarReservaRequestDto)
 */
export const reprogramarReservaSchema = z.object({
  fechaReserva: fechaReservaSchema,
  horarioInicio: horarioSchema,
  horarioFin: horarioSchema,
});

export type ReservaRequestFormValues = z.infer<typeof reservaRequestSchema>;
export type ReprogramarReservaFormValues = z.infer<typeof reprogramarReservaSchema>;
export type ReservaFormValues = ReservaRequestFormValues;
