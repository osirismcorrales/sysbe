/**
 * UsuarioFormDialog.tsx
 * Modal presentacional para crear y editar usuarios.
 * Recibe datos del formulario y callbacks, sin lógica de negocio.
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { FechaInput } from '../../../components/ui/FechaInput';
import type { CategoriaResponseDto } from '../../socios/services/sociosApi';

// ─── Tipos del formulario ───────────────────────────────────────────────────

export interface UsuarioFormData {
  dni: string;
  nombreCompleto: string;
  email: string;
  fechaNacimiento: string;
  estado: string;
  domicilio: string;
  passwordHash: string;
  rolId: number;
  categoriaId: number;
}

interface UsuarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  formData: UsuarioFormData;
  onFormChange: (data: UsuarioFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  /** Si es true oculta el campo de contraseña (ej: al editar) */
  hidePassword?: boolean;
  categorias?: CategoriaResponseDto[];
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function UsuarioFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  formData,
  onFormChange,
  onSubmit,
  hidePassword = false,
  categorias = [],
}: UsuarioFormDialogProps) {
  const update = (field: keyof UsuarioFormData, value: string | number) => {
    onFormChange({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 mt-2">
          {/* DNI y Nombre */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700 flex justify-between">
                <span>DNI</span>
                <span className="text-[10px] text-gray-400 font-normal">7-8 dígitos</span>
              </label>
              <input
                type="text"
                placeholder="Ej. 38123456"
                minLength={7}
                maxLength={8}
                value={formData.dni}
                onChange={(e) => update('dni', e.target.value)}
                className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={formData.nombreCompleto}
                onChange={(e) => update('nombreCompleto', e.target.value)}
                className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              placeholder="ejemplo@email.com"
              value={formData.email}
              onChange={(e) => update('email', e.target.value)}
              className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              required
            />
          </div>

          {/* Fecha de Nacimiento y Domicilio */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Fecha de Nacimiento</label>
              <FechaInput
                value={formData.fechaNacimiento}
                onChange={(val) => update('fechaNacimiento', val)}
                outputFormat="iso-datetime"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Domicilio</label>
              <input
                type="text"
                placeholder="Ej. Av. Belgrano 1234"
                value={formData.domicilio}
                onChange={(e) => update('domicilio', e.target.value)}
                className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              />
            </div>
          </div>

          {/* Contraseña (solo al crear o si se muestra) */}
          {!hidePassword && (
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700 flex justify-between">
                <span>Contraseña</span>
                <span className="text-[10px] text-gray-400 font-normal">Mín. 8 caracteres</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                minLength={8}
                value={formData.passwordHash}
                onChange={(e) => update('passwordHash', e.target.value)}
                className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                required
              />
            </div>
          )}

          {/* Rol, Categoría y Estado */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Rol</label>
              <select
                value={formData.rolId}
                onChange={(e) => update('rolId', Number(e.target.value))}
                className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                required
              >
                <option value={0} disabled>Seleccionar...</option>
                <option value={1}>Administrador</option>
                <option value={2}>Empleado</option>
                <option value={3}>Usuario</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Categoría</label>
              <select
                value={formData.categoriaId}
                onChange={(e) => update('categoriaId', Number(e.target.value))}
                className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                required
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
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => update('estado', e.target.value)}
                className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              >
                <option value="ACTIVO">Activo</option>
                <option value="DE_BAJA">De baja</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
              Cancelar
            </Button>
            <Button type="submit" variant="brand" size="sm" className="text-xs font-semibold">
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
