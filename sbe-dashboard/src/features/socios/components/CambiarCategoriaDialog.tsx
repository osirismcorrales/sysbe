/**
 * CambiarCategoriaDialog.tsx
 * Modal para asignar o cambiar la categoría de un socio.
 * Validado con React Hook Form + Zod según AsignarCategoriaRequestDto.
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { FieldError } from '../../../components/ui/FieldError';
import { handleApiFormError } from '../../../lib/handleApiFormError';
import { Loader2 } from 'lucide-react';
import type { SocioResponseDto, CategoriaResponseDto } from '../services/sociosApi';
import {
  asignarCategoriaSchema,
  type AsignarCategoriaFormValues,
} from '../schemas/socioSchemas';

interface CambiarCategoriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  socio: SocioResponseDto | null;
  categorias: CategoriaResponseDto[];
  onSubmit: (dni: string, categoriaId: number) => Promise<unknown>;
}

export function CambiarCategoriaDialog({
  open,
  onOpenChange,
  socio,
  categorias,
  onSubmit,
}: CambiarCategoriaDialogProps) {
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [selectedVinculo, setSelectedVinculo] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<AsignarCategoriaFormValues>({
    resolver: zodResolver(asignarCategoriaSchema) as any,
    defaultValues: {
      categoriaId: 0,
    },
  });

  // Inicializar tipo y vínculo cuando cambia el socio
  useEffect(() => {
    if (socio && open) {
      setServerError(null);
      const catActual = categorias.find((c) => c.idCategoria === socio.idCategoria);
      const tipo = catActual ? catActual.tipoSocio : (socio.tipoSocio || (categorias[0]?.tipoSocio ?? ''));
      setSelectedTipo(tipo);

      const vinculosForTipo = categorias.filter((c) => c.tipoSocio === tipo);
      const matchedVinculo = catActual
        ? (catActual.vinculoUnse ?? '')
        : (socio.vinculoUnse || (vinculosForTipo[0]?.vinculoUnse ?? ''));
      setSelectedVinculo(matchedVinculo);
    }
  }, [socio, open, categorias]);

  const availableVinculosForTipo = categorias.filter((c) => c.tipoSocio === selectedTipo);

  const selectedCategoria =
    categorias.find(
      (c) =>
        c.tipoSocio === selectedTipo &&
        (c.vinculoUnse ?? '') === (selectedVinculo ?? '')
    ) ||
    availableVinculosForTipo[0] ||
    null;

  useEffect(() => {
    if (selectedCategoria) {
      setValue('categoriaId', selectedCategoria.idCategoria, { shouldValidate: true });
    }
  }, [selectedCategoria, setValue]);

  const handleTipoChange = (newTipo: string) => {
    setSelectedTipo(newTipo);
    const vinculos = categorias.filter((c) => c.tipoSocio === newTipo);
    if (vinculos.length > 0) {
      setSelectedVinculo(vinculos[0].vinculoUnse ?? '');
    } else {
      setSelectedVinculo('');
    }
  };

  const onFormSubmit = async (data: AsignarCategoriaFormValues) => {
    if (!socio) return;
    setServerError(null);
    setSubmitting(true);
    try {
      await onSubmit(socio.dni, data.categoriaId);
      onOpenChange(false);
    } catch (err) {
      handleApiFormError(err, setError as any);
      setServerError((err as Error).message || 'Error al actualizar la categoría.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!socio) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Categoría de Socio</DialogTitle>
          <DialogDescription>
            Modifique la membresía y vínculo de <span className="font-bold text-gray-900">{socio.nombreCompleto}</span> (DNI: {socio.dni}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 mt-2">
          {/* Selector 1: Tipo de Socio */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700">Tipo de Socio</label>
            <select
              value={selectedTipo}
              onChange={(e) => handleTipoChange(e.target.value)}
              className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs cursor-pointer font-medium"
              required
            >
              <option value="" disabled>Seleccionar tipo...</option>
              {Array.from(new Set(categorias.map((c) => c.tipoSocio))).map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo === 'INTERNO'
                    ? 'Socio Interno'
                    : tipo === 'EXTERNO'
                    ? 'Socio Externo'
                    : tipo === 'NO_SOCIO'
                    ? 'No Socio'
                    : tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Selector 2: Vínculo UNSE */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700">Vínculo UNSE</label>
            <select
              value={selectedVinculo}
              onChange={(e) => setSelectedVinculo(e.target.value)}
              className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs cursor-pointer font-medium disabled:bg-gray-100 disabled:text-gray-400"
              required
              disabled={availableVinculosForTipo.length <= 1 && !availableVinculosForTipo[0]?.vinculoUnse}
            >
              {availableVinculosForTipo.map((cat) => (
                <option key={cat.idCategoria} value={cat.vinculoUnse ?? ''}>
                  {cat.vinculoUnse ? cat.vinculoUnse : 'Sin vínculo'}
                </option>
              ))}
            </select>
          </div>

          <FieldError message={errors.categoriaId?.message} />

          {/* Condiciones resultantes: Cuota y Descuento */}
          {selectedCategoria && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Condiciones de la categoría
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-gray-400 block text-[11px] font-medium">Cuota mensual</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {selectedCategoria.cuotaMensual > 0
                      ? `$${selectedCategoria.cuotaMensual.toLocaleString('es-AR')}`
                      : 'Sin costo ($0)'}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-gray-400 block text-[11px] font-medium">Descuento</span>
                  <span className={`font-bold text-sm ${selectedCategoria.descuento > 0 ? 'text-green-600' : 'text-gray-700'}`}>
                    {selectedCategoria.descuento}%
                  </span>
                </div>
                {selectedCategoria.cuotaTrimestral > 0 && (
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                    <span className="text-gray-400 block text-[10px] font-medium">Cuota trimestral</span>
                    <span className="font-semibold text-gray-800 text-xs">
                      ${selectedCategoria.cuotaTrimestral.toLocaleString('es-AR')}
                    </span>
                  </div>
                )}
                {selectedCategoria.cuotaAnual > 0 && (
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                    <span className="text-gray-400 block text-[10px] font-medium">Cuota anual</span>
                    <span className="font-semibold text-gray-800 text-xs">
                      ${selectedCategoria.cuotaAnual.toLocaleString('es-AR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

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
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="brand"
              size="sm"
              disabled={!selectedCategoria || submitting}
              className="text-xs font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Guardando…
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CambiarCategoriaDialog;
