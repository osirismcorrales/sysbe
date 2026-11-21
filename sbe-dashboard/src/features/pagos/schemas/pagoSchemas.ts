/**
 * pagoSchemas.ts
 * Esquemas Zod alineados con PagoRequestDto del backend.
 */

import { z } from 'zod';

const PERIODO_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const idUsuarioSchema = z.coerce
  .number({ error: 'El usuario es obligatorio.' })
  .int('El usuario es obligatorio.')
  .positive('Seleccione un usuario válido.');

const idReservaSchema = z.coerce
  .number({ error: 'La reserva es obligatoria.' })
  .int('La reserva es obligatoria.')
  .nonnegative('Seleccione una reserva válida.');

const montoSchema = z.coerce
  .number({ error: 'El monto es obligatorio.' })
  .positive('El monto debe ser mayor a 0.')
  .max(9_999_999_999.99, 'El monto supera el límite permitido.');

export const pagoRequestSchema = z
  .object({
    idUsuario: idUsuarioSchema,
    tipoPago: z.enum(['RESERVA', 'CUOTA_MEMBRESIA'], {
      error: 'El tipo de pago es obligatorio.',
    }),
    idReserva: idReservaSchema.optional(),
    periodo: z.string().optional(),
    montoPago: montoSchema,
    metodoPago: z.enum(
      ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'DEBITO', 'MERCADO_PAGO'],
      { error: 'El método de pago es obligatorio.' }
    ),
    estadoPago: z.enum(['PENDIENTE', 'APROBADO'], {
      error: 'El estado inicial es obligatorio.',
    }),
  })
  .superRefine((data, ctx) => {
    if (data.tipoPago === 'RESERVA') {
      if (!data.idReserva || data.idReserva <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['idReserva'],
          message: 'Seleccione la reserva asociada al pago.',
        });
      }
      return;
    }

    const periodo = (data.periodo ?? '').trim();
    if (!PERIODO_REGEX.test(periodo)) {
      ctx.addIssue({
        code: 'custom',
        path: ['periodo'],
        message: 'Indique el período en formato AAAA-MM (ej. 2026-11).',
      });
    }
  });

export type PagoFormValues = z.infer<typeof pagoRequestSchema>;

/** Período actual en formato AAAA-MM. */
export function getPeriodoActual(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
