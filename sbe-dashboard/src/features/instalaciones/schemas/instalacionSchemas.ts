/**
 * Esquema Zod alineado con InstalacionRequestDto del backend.
 */
import { z } from 'zod';

export const instalacionRequestSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(60, 'El nombre no puede superar los 60 caracteres'),
  descripcion: z
    .string()
    .trim()
    .min(1, 'La descripción es obligatoria')
    .max(60, 'La descripción no puede superar los 60 caracteres'),
  estado: z
    .string()
    .trim()
    .min(1, 'El estado es obligatorio')
    .max(40, 'El estado no puede superar los 40 caracteres'),
  precioBase: z.coerce
    .number({ error: 'El precio base es obligatorio.' })
    .gt(0, 'El precio base debe ser mayor a 0 (no se permite 0 ni valores negativos).'),
  duracionMinutos: z.coerce
    .number({ error: 'La duración en minutos es obligatoria.' })
    .int('La duración debe ser un número entero.')
    .gt(0, 'La duración debe ser mayor a 0 minutos (no se permite 0 ni valores negativos).'),
});

export type InstalacionRequestFormValues = z.infer<typeof instalacionRequestSchema>;
