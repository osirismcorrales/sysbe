import type { FieldValues, UseFormSetError, Path } from 'react-hook-form';
import { ApiError } from './apiClient';
import { toast } from '../components/ui/Toast';

/**
 * handleApiFormError
 *
 * Implementa el flujo arquitectónico:
 * - 400 / 422: Extrae campos inválidos del backend y los asigna a setError de RHF
 * - 409: Conflicto (duplicado, clave foránea, horario ocupado) -> Toast / Alert de advertencia
 * - 500: Error interno de servidor -> Toast de error
 * - Otros: Toast con mensaje amigable
 */
export function handleApiFormError<TFieldValues extends FieldValues>(
  error: unknown,
  setError?: UseFormSetError<TFieldValues>,
  customNotify?: {
    toastError?: (msg: string, title?: string) => void;
    toastWarning?: (msg: string, title?: string) => void;
  }
): void {
  const notifyError = customNotify?.toastError || toast.error;
  const notifyWarning = customNotify?.toastWarning || toast.warning;

  if (error instanceof ApiError) {
    const status = error.status;

    // ─── 400 / 422: Errores de Validación de Campos ─────────────────────────
    if (status === 400 || status === 422) {
      const campos = error.campos;
      let mappedAny = false;

      if (campos && setError) {
        Object.entries(campos).forEach(([field, message]) => {
          // Asigna el error directamente al campo correspondiente en React Hook Form
          setError(field as Path<TFieldValues>, {
            type: 'server',
            message: message || 'Valor inválido',
          });
          mappedAny = true;
        });
      }

      // Si no se mapeó ningún campo específico a RHF o hay mensaje general, mostrar aviso
      if (!mappedAny) {
        notifyWarning(error.mensaje || 'Hay campos con valores no válidos en el formulario.', 'Datos Inválidos');
      }
      return;
    }

    // ─── 409: Conflicto de Datos (DNI/Email duplicado, solapamiento) ────────
    if (status === 409) {
      notifyWarning(
        error.mensaje || 'La operación entra en conflicto con registros existentes.',
        'Conflicto de Datos'
      );
      return;
    }

    // ─── 403 / 404 / 500 u otros ───────────────────────────────────────────
    if (status === 403) {
      notifyError('No cuenta con los permisos necesarios para realizar esta acción.', 'Acceso Denegado');
      return;
    }

    if (status === 404) {
      notifyError(error.mensaje || 'El recurso solicitado no fue encontrado.', 'No Encontrado');
      return;
    }

    if (status >= 500) {
      notifyError(
        error.mensaje || 'Ocurrió un problema interno en el servidor. Intente nuevamente.',
        'Error del Servidor'
      );
      return;
    }

    notifyError(error.mensaje || error.message || 'Ocurrió un error inesperado.');
    return;
  }

  // Error no controlado (red, excepción JS)
  const message = error instanceof Error ? error.message : 'Error inesperado';
  notifyError(message, 'Error');
}
