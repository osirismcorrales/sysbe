/**
 * InstalacionFormDialog.tsx
 * Modal reutilizable para crear y editar instalaciones.
 * Componente presentacional: recibe datos del formulario y callbacks.
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';

export interface InstalacionFormData {
  nombre: string;
  descripcion: string;
  precioBase: number;
  duracionMinutos: number;
  estado: string;
}

interface InstalacionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  formData: InstalacionFormData;
  onFormChange: (data: InstalacionFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function InstalacionFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  formData,
  onFormChange,
  onSubmit,
}: InstalacionFormDialogProps) {
  const update = (field: keyof InstalacionFormData, value: string | number) => {
    onFormChange({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700 flex justify-between">
              <span>Nombre de la Instalación</span>
              <span className="text-[10px] text-gray-400 font-normal">Máx. 60 caracteres</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Cancha de Paddle"
              maxLength={60}
              value={formData.nombre}
              onChange={(e) => update('nombre', e.target.value)}
              className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700 flex justify-between">
              <span>Descripción</span>
              <span className="text-[10px] text-gray-400 font-normal">Máx. 60 caracteres</span>
            </label>
            <textarea
              placeholder="Detalle la instalación..."
              maxLength={60}
              value={formData.descripcion}
              onChange={(e) => update('descripcion', e.target.value)}
              className="h-20 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Precio Base ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.precioBase}
                onChange={(e) => update('precioBase', Number(e.target.value))}
                className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Duración (minutos)</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Ej. 60"
                value={formData.duracionMinutos}
                onChange={(e) => update('duracionMinutos', Number(e.target.value))}
                className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700">Estado</label>
            <select
              value={formData.estado}
              onChange={(e) => update('estado', e.target.value)}
              className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
            >
              <option value="Habilitada">Habilitada</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Deshabilitada">Deshabilitada</option>
            </select>
          </div>

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
