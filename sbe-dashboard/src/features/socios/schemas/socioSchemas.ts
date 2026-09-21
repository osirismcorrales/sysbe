/**
 * socioSchemas.ts
 * Esquemas Zod alineados con AsignarCategoriaRequestDto y AjustePuntosRequestDto del backend.
 */
import { z } from 'zod';

/**
 * Esquema para PUT /api/socios/:dni/categoria (AsignarCategoriaRequestDto)
 */
export const asignarCategoriaSchema = z.object({
  categoriaId: z.coerce
    .number({ error: 'El ID de la categoría es obligatorio.' })
    .int('El ID de categoría debe ser un número entero.')
    .positive('Debe seleccionar una categoría válida.'),
});

/**
 * Esquema para POST /api/socios/:dni/puntos/sumar y canjear (AjustePuntosRequestDto)
 */
export const ajustePuntosSchema = z.object({
  puntos: z.coerce
    .number({ error: 'La cantidad de puntos es obligatoria.' })
    .int('La cantidad de puntos debe ser un número entero.')
    .positive('La cantidad de puntos debe ser mayor a 0.'),
});

/**
 * Esquema para formulario de alta de socio (compatibilidad)
 */
export const socioSchema = z.object({
  dni: z
    .string()
    .min(7, 'El DNI debe tener al menos 7 dígitos')
    .max(9, 'El DNI debe tener máximo 9 dígitos')
    .regex(/^\d+$/, 'El DNI debe contener solo números'),
  nombre: z
    .string({ error: 'El nombre no puede ser nulo.' })
    .trim()
    .min(1, 'El nombre no puede estar vacío.')
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, 'El nombre solo puede contener texto (letras y espacios).'),
  email: z.string().email('Debe ser un correo electrónico válido'),
  fechaNacimiento: z
    .string()
    .min(1, 'La fecha de nacimiento es requerida')
    .refine((val) => val.length >= 10, { message: 'Complete la fecha (DD/MM/AAAA)' })
    .refine(
      (val) => {
        let iso = val.slice(0, 10);
        if (iso.includes('/')) {
          const [d, m, y] = iso.split('/');
          iso = `${y}-${m}-${d}`;
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return true;
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        return iso <= today;
      },
      { message: 'La fecha de nacimiento no puede exceder la fecha actual ni ser futura.' }
    )
    .refine(
      (val) => {
        let iso = val.slice(0, 10);
        if (iso.includes('/')) {
          const [d, m, y] = iso.split('/');
          iso = `${y}-${m}-${d}`;
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return true;
        const now = new Date();
        const minDate = `${now.getFullYear() - 120}-01-01`;
        return iso >= minDate;
      },
      { message: `La fecha de nacimiento no puede ser mayor a 120 años (mínimo ${new Date().getFullYear() - 120}).` }
    ),
  domicilio: z.string().min(5, 'El domicilio debe tener al menos 5 caracteres'),
  categoria: z.string().min(1, 'La categoría es requerida'),
  vinculo: z.string().optional(),
});

export type SocioFormValues = z.infer<typeof socioSchema>;
export type AsignarCategoriaFormValues = z.infer<typeof asignarCategoriaSchema>;
export type AjustePuntosFormValues = z.infer<typeof ajustePuntosSchema>;

