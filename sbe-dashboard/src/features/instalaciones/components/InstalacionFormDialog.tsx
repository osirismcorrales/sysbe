/**
 * InstalacionFormDialog.tsx
 * Modal de alta/edición de instalaciones con validación RHF + Zod
 * según InstalacionRequestDto.
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { FieldError } from '../../../components/ui/FieldError';
import { cn } from '../../../lib/utils';
import { handleApiFormError } from '../../../lib/handleApiFormError';
import {
  instalacionRequestSchema,
  type InstalacionRequestFormValues,
} from '../schemas/instalacionSchemas';
import type { InstalacionRequestDto } from '../services/instalacionesApi';

export type InstalacionFormData = InstalacionRequestFormValues;

export const EMPTY_INSTALACION_FORM: InstalacionFormData = {
  nombre: '',
  descripcion: '',
  precioBase: '' as unknown as number,
  duracionMinutos: 60,
  estado: 'Habilitada',
};

interface InstalacionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  initialValues?: Partial<InstalacionFormData>;
  onSubmit: (data: InstalacionRequestDto) => Promise<void>;
}

function inputClass(error?: boolean, extra?: string) {
  return cn(
    'h-9 px-3 border rounded-lg focus:outline-none focus:ring-2 text-xs bg-white',
    extra,
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:ring-primary/20 focus:border-primary'
  );
}

export function InstalacionFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
}: InstalacionFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InstalacionFormData>({
    resolver: zodResolver(instalacionRequestSchema) as any,
    defaultValues: { ...EMPTY_INSTALACION_FORM, ...initialValues },
  });

  useEffect(() => {
    if (open) {
      reset({ ...EMPTY_INSTALACION_FORM, ...initialValues });
    }
  }, [open, initialValues, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values as InstalacionRequestDto);
      onOpenChange(false);
    } catch (err) {
      handleApiFormError(err, setError);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="space-y-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700 flex justify-between">
              <span>Nombre de la Instalación</span>
              <span className="text-[10px] text-gray-400 font-normal">Máx. 60 caracteres</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Cancha de Paddle"
              maxLength={60}
              className={inputClass(!!errors.nombre)}
              {...register('nombre')}
            />
            <FieldError message={errors.nombre?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700 flex justify-between">
              <span>Descripción</span>
              <span className="text-[10px] text-gray-400 font-normal">Máx. 60 caracteres</span>
            </label>
            <textarea
              placeholder="Detalle la instalación..."
              maxLength={60}
              className={cn(inputClass(!!errors.descripcion, 'h-20 p-3 resize-none'))}
              {...register('descripcion')}
            />
            <FieldError message={errors.descripcion?.message} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Precio Base ($)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ej. 1500"
                className={inputClass(!!errors.precioBase)}
                {...register('precioBase', { valueAsNumber: true })}
              />
              <FieldError message={errors.precioBase?.message} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Duración (minutos)</label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Ej. 60"
                className={inputClass(!!errors.duracionMinutos)}
                {...register('duracionMinutos', { valueAsNumber: true })}
              />
              <FieldError message={errors.duracionMinutos?.message} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700">Estado</label>
            <select
              className={inputClass(!!errors.estado)}
              {...register('estado')}
            >
              <option value="Habilitada">Habilitada</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Deshabilitada">Deshabilitada</option>
            </select>
            <FieldError message={errors.estado?.message} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
              Cancelar
            </Button>
            <Button type="submit" variant="brand" size="sm" className="text-xs font-semibold" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
