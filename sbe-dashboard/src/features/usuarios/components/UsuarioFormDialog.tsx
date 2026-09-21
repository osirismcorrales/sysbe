/**
 * UsuarioFormDialog.tsx
 * Modal de alta/edición de usuarios con validación RHF + Zod
 * según UsuarioRequestDto / UsuarioUpdateDto.
 */

import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { FechaInput } from '../../../components/ui/FechaInput';
import { FieldError } from '../../../components/ui/FieldError';
import { cn } from '../../../lib/utils';
import type { CategoriaResponseDto } from '../../socios/services/sociosApi';
import type { UsuarioRequestDto, UsuarioUpdateDto } from '../services/usuariosApi';
import { handleApiFormError } from '../../../lib/handleApiFormError';
import {
  usuarioRequestSchema,
  usuarioUpdateSchema,
  type UsuarioFormValues,
} from '../schemas/usuarioSchemas';

export type UsuarioFormData = UsuarioFormValues;

export const EMPTY_USUARIO_FORM: UsuarioFormValues = {
  dni: '',
  nombreCompleto: '',
  email: '',
  fechaNacimiento: '',
  estado: 'ACTIVO',
  domicilio: '',
  passwordHash: '',
  rolId: 0,
  categoriaId: 0,
};

interface UsuarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  initialValues?: Partial<UsuarioFormValues>;
  onSubmit: (data: UsuarioRequestDto | UsuarioUpdateDto) => Promise<void>;
  hidePassword?: boolean;
  categorias: CategoriaResponseDto[];
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

export function UsuarioFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  hidePassword = false,
  categorias,
}: UsuarioFormDialogProps) {
  const schema = hidePassword ? usuarioUpdateSchema : usuarioRequestSchema;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { ...EMPTY_USUARIO_FORM, ...initialValues },
  });

  useEffect(() => {
    if (open) {
      reset({ ...EMPTY_USUARIO_FORM, ...initialValues });
    }
  }, [open, initialValues, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      if (hidePassword) {
        const { passwordHash: _omit, ...updateDto } = values;
        await onSubmit(updateDto as UsuarioUpdateDto);
      } else {
        await onSubmit(values as UsuarioRequestDto);
      }
      onOpenChange(false);
    } catch (err) {
      handleApiFormError(err, setError);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700 flex justify-between">
                <span>DNI</span>
                <span className="text-[10px] text-gray-400 font-normal">7-8 dígitos</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ej. 38123456"
                maxLength={8}
                className={inputClass(!!errors.dni)}
                {...register('dni')}
              />
              <FieldError message={errors.dni?.message} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                maxLength={100}
                className={inputClass(!!errors.nombreCompleto)}
                {...register('nombreCompleto')}
              />
              <FieldError message={errors.nombreCompleto?.message} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              placeholder="ejemplo@email.com"
              maxLength={120}
              className={inputClass(!!errors.email)}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Fecha de Nacimiento</label>
              <Controller
                name="fechaNacimiento"
                control={control}
                render={({ field, fieldState }) => (
                  <FechaInput
                    aria-label="Fecha de Nacimiento"
                    value={field.value}
                    onChange={field.onChange}
                    outputFormat="iso-datetime"
                    required
                    error={!!fieldState.error}
                  />
                )}
              />
              <FieldError message={errors.fechaNacimiento?.message} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Domicilio</label>
              <input
                type="text"
                placeholder="Ej. Av. Belgrano 1234"
                maxLength={100}
                className={inputClass(!!errors.domicilio)}
                {...register('domicilio')}
              />
              <FieldError message={errors.domicilio?.message} />
            </div>
          </div>

          {!hidePassword && (
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700 flex justify-between">
                <span>Contraseña</span>
                <span className="text-[10px] text-gray-400 font-normal">Mín. 8 caracteres</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClass(!!errors.passwordHash)}
                {...register('passwordHash')}
              />
              <FieldError message={errors.passwordHash?.message} />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Rol</label>
              <select
                className={inputClass(!!errors.rolId)}
                {...register('rolId', { valueAsNumber: true })}
              >
                <option value={0} disabled>Seleccionar...</option>
                <option value={1}>Administrador</option>
                <option value={2}>Empleado</option>
                <option value={3}>Usuario</option>
              </select>
              <FieldError message={errors.rolId?.message} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Categoría</label>
              <select
                className={inputClass(!!errors.categoriaId)}
                {...register('categoriaId', { valueAsNumber: true })}
              >
                <option value={0} disabled>Seleccionar...</option>
                {categorias && categorias.length > 0 ? (
                  categorias.map((c) => (
                    <option key={c.idCategoria} value={c.idCategoria}>
                      {c.etiqueta || (c.vinculoUnse ? `${c.tipoSocio} · ${c.vinculoUnse}` : c.tipoSocio)}
                    </option>
                  ))
                ) : (
                  <>
                    <option value={1}>Interno</option>
                    <option value={2}>Externo</option>
                    <option value={3}>No socio</option>
                  </>
                )}
              </select>
              <FieldError message={errors.categoriaId?.message} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Estado</label>
              <select
                className={inputClass(!!errors.estado)}
                {...register('estado')}
              >
                <option value="ACTIVO">Activo</option>
                <option value="DE_BAJA">De baja</option>
              </select>
              <FieldError message={errors.estado?.message} />
            </div>
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
