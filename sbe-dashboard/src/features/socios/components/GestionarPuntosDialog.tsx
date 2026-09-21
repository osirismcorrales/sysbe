/**
 * GestionarPuntosDialog.tsx
 * Modal para sumar o canjear puntos de un socio.
 * Validado con React Hook Form + Zod según AjustePuntosRequestDto.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { FieldError } from '../../../components/ui/FieldError';
import { handleApiFormError } from '../../../lib/handleApiFormError';
import { Award, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { SocioResponseDto } from '../services/sociosApi';
import {
  ajustePuntosSchema,
  type AjustePuntosFormValues,
} from '../schemas/socioSchemas';

interface GestionarPuntosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  socio: SocioResponseDto | null;
  onSumar: (dni: string, puntos: number) => Promise<unknown>;
  onCanjear: (dni: string, puntos: number) => Promise<unknown>;
}

export function GestionarPuntosDialog({
  open,
  onOpenChange,
  socio,
  onSumar,
  onCanjear,
}: GestionarPuntosDialogProps) {
  const [submittingAction, setSubmittingAction] = useState<'sumar' | 'canjear' | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AjustePuntosFormValues>({
    resolver: zodResolver(ajustePuntosSchema) as any,
    defaultValues: {
      puntos: 10,
    },
  });

  React.useEffect(() => {
    if (open) {
      setServerError(null);
      setSubmittingAction(null);
      reset({ puntos: 10 });
    }
  }, [open, reset]);

  if (!socio) return null;

  const handleAction = (action: 'sumar' | 'canjear') => {
    return handleSubmit(async (data: AjustePuntosFormValues) => {
      setServerError(null);
      setSubmittingAction(action);
      try {
        if (action === 'sumar') {
          await onSumar(socio.dni, data.puntos);
        } else {
          if (data.puntos > socio.puntosAc) {
            setServerError(`El socio solo dispone de ${socio.puntosAc} puntos para canjear.`);
            return;
          }
          await onCanjear(socio.dni, data.puntos);
        }
        onOpenChange(false);
      } catch (err) {
        handleApiFormError(err, setError as any);
        setServerError((err as Error).message || `Error al ${action} puntos.`);
      } finally {
        setSubmittingAction(null);
      }
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Gestionar Puntos
          </DialogTitle>
          <DialogDescription>
            <span className="font-bold">{socio.nombreCompleto}</span> tiene actualmente{' '}
            <span className="font-bold text-amber-600">{socio.puntosAc} puntos</span>.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 mt-2" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700">Cantidad de Puntos</label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Ej. 50"
              {...register('puntos')}
              className={cn(
                'h-9 px-3 border rounded-lg focus:outline-none focus:ring-2 text-xs bg-white',
                errors.puntos
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-primary/20 focus:border-primary'
              )}
            />
            <FieldError message={errors.puntos?.message} />
          </div>

          {serverError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
              {serverError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
              disabled={submittingAction !== null}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAction('canjear')}
              disabled={submittingAction !== null || socio.puntosAc <= 0}
              className="text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50"
            >
              {submittingAction === 'canjear' ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Canjeando…
                </>
              ) : (
                'Canjear'
              )}
            </Button>
            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={() => handleAction('sumar')}
              disabled={submittingAction !== null}
              className="text-xs font-semibold"
            >
              {submittingAction === 'sumar' ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Sumando…
                </>
              ) : (
                'Sumar Puntos'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default GestionarPuntosDialog;
