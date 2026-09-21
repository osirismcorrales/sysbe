/**
 * InstalacionesPage.tsx
 * Componente contenedor (smart component) que maneja estado y lógica.
 * Delega toda la presentación a los componentes tontos (dumb components).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useInstalaciones } from '../hooks/useInstalaciones';
import { Button } from '../../../components/ui/Button';
import { Plus, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

// Componentes presentacionales
import {
  InstalacionCard,
  type InstalacionCardData,
  type DiaHorarioInfo,
} from '../components/InstalacionCard';
import {
  InstalacionFormDialog,
  type InstalacionFormData,
} from '../components/InstalacionFormDialog';
import { HorarioDialog } from '../components/HorarioDialog';
import {
  listarPlantillas,
  formatHora,
  calcDuracionHoras,
  DIAS_SEMANA_CONFIG,
  type DiaSemana,
  type PlantillaHorarioResponseDto,
} from '../services/plantillasHorarioApi';

// ─── Helpers ────────────────────────────────────────────────────────────────

const EMPTY_FORM: InstalacionFormData = {
  nombre: '',
  descripcion: '',
  precioBase: 0,
  duracionMinutos: 60,
  estado: 'Habilitada',
};

const DIAS_ORDER: DiaSemana[] = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
];

// ─── Componente contenedor ──────────────────────────────────────────────────

export function InstalacionesPage() {
  const {
    instalaciones,
    loading,
    error,
    refresh,
    crear,
    actualizar,
    cambiarEstado,
  } = useInstalaciones();

  // Mapeo number id → string id para compatibilidad con la UI
  const instalacionesList: InstalacionCardData[] = instalaciones.map((i) => ({
    ...i,
    id: String(i.id),
  }));

  // ─── Plantillas reales del backend ──────────────────────────────────────
  const [plantillas, setPlantillas] = useState<PlantillaHorarioResponseDto[]>([]);

  const loadPlantillas = useCallback(async () => {
    try {
      const data = await listarPlantillas();
      setPlantillas(data);
    } catch (err) {
      console.error('Error al cargar plantillas de horario:', err);
    }
  }, []);

  useEffect(() => {
    loadPlantillas();
  }, [loadPlantillas]);

  // ─── Modal states ───────────────────────────────────────────────────────

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newForm, setNewForm] = useState<InstalacionFormData>({ ...EMPTY_FORM });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<InstalacionFormData>({ ...EMPTY_FORM });

  const [horarioTargetId, setHorarioTargetId] = useState<number | null>(null);
  const [horarioTargetName, setHorarioTargetName] = useState('');

  // ─── Handlers: Crear ────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crear(newForm);
      setIsNewOpen(false);
      setNewForm({ ...EMPTY_FORM });
    } catch (err) {
      alert(`Error al crear instalación: ${(err as Error).message}`);
    }
  };

  // ─── Handlers: Editar info ──────────────────────────────────────────────

  const handleEditInfoClick = (instalacion: InstalacionCardData) => {
    setEditingId(instalacion.id);
    setEditForm({
      nombre: instalacion.nombre || '',
      descripcion: instalacion.descripcion || '',
      precioBase: instalacion.precioBase ?? 0,
      duracionMinutos: instalacion.duracionMinutos ?? 60,
      estado: instalacion.estado || 'Habilitada',
    });
  };

  const handleEditInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await actualizar(Number(editingId), editForm);
      setEditingId(null);
    } catch (err) {
      alert(`Error al actualizar instalación: ${(err as Error).message}`);
    }
  };

  // ─── Handlers: Horarios ─────────────────────────────────────────────────

  const handleEditHorarioClick = (instalacion: InstalacionCardData) => {
    setHorarioTargetId(Number(instalacion.id));
    setHorarioTargetName(instalacion.nombre);
  };

  // ─── Handlers: Estado ───────────────────────────────────────────────────

  const handleStatusChange = async (id: string, estado: string) => {
    try {
      await cambiarEstado(Number(id), estado);
    } catch (err) {
      alert(`Error al cambiar estado: ${(err as Error).message}`);
    }
  };

  // ─── Helpers: cálculo de horarios desde plantillas reales ───────────────

  const getHorarioSummary = (instalacionId: string): string => {
    const instPlantillas = plantillas.filter(
      (p) => String(p.idInstalacion) === instalacionId
    );
    if (instPlantillas.length === 0) return 'Sin configurar';

    const dias = new Set(instPlantillas.map((p) => p.diaSemana));
    if (dias.size === 7) return 'Todos los días';
    if (dias.size === 6 && !dias.has('DOMINGO')) return 'Lun a Sáb';
    if (
      dias.size === 5 &&
      dias.has('LUNES') &&
      dias.has('MARTES') &&
      dias.has('MIERCOLES') &&
      dias.has('JUEVES') &&
      dias.has('VIERNES')
    ) {
      return 'Lun a Vie';
    }
    return `${dias.size} días abiertos`;
  };

  const getHorariosList = (instalacionId: string): DiaHorarioInfo[] => {
    const instPlantillas = plantillas.filter(
      (p) => String(p.idInstalacion) === instalacionId
    );
    if (instPlantillas.length === 0) return [];

    return instPlantillas
      .slice()
      .sort((a, b) => DIAS_ORDER.indexOf(a.diaSemana) - DIAS_ORDER.indexOf(b.diaSemana))
      .map((p) => {
        const config = DIAS_SEMANA_CONFIG.find((c) => c.key === p.diaSemana);
        const inicio = formatHora(p.horaInicio);
        const fin = formatHora(p.horaFin);
        return {
          diaSemana: p.diaSemana,
          label: config?.label || p.diaSemana,
          shortLabel: config?.shortLabel || p.diaSemana.substring(0, 3),
          horaInicio: inicio,
          horaFin: fin,
          horasTotales: calcDuracionHoras(inicio, fin),
        };
      });
  };

  const handleFullRefresh = () => {
    refresh();
    loadPlantillas();
  };

  // ─── Loading & Error states ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
        <span className="text-sm font-medium">Cargando instalaciones...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <span className="font-semibold text-sm">Error al conectar con el backend</span>
        </div>
        <p className="text-xs text-gray-400 max-w-sm text-center">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleFullRefresh}
          className="flex items-center gap-1.5 text-xs cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reintentar
        </Button>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 select-none text-xs">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border border-gray-200 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Gestión de Instalaciones</h2>
          <p className="font-medium text-gray-500 text-xs mt-0.5">
            Administre instalaciones, días de apertura y rangos horarios para las reservas del Polideportivo
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleFullRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 font-semibold text-xs rounded-lg shadow-xs h-8 cursor-pointer"
            title="Actualizar desde el servidor"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizar
          </Button>
          <Button
            onClick={() => setIsNewOpen(true)}
            variant="brand"
            size="sm"
            className="flex items-center gap-1.5 font-semibold text-xs rounded-lg shadow-xs h-8 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nueva Instalación
          </Button>
        </div>
      </div>

      {/* Instalaciones Grid - Responsive y adaptable */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {instalacionesList.map((instalacion) => (
          <InstalacionCard
            key={instalacion.id}
            instalacion={instalacion}
            horariosList={getHorariosList(instalacion.id)}
            horarioSummary={getHorarioSummary(instalacion.id)}
            onStatusChange={handleStatusChange}
            onEditInfo={handleEditInfoClick}
            onEditHorario={handleEditHorarioClick}
          />
        ))}
      </div>

      {/* Modal: Crear instalación */}
      <InstalacionFormDialog
        open={isNewOpen}
        onOpenChange={setIsNewOpen}
        title="Registrar Nueva Instalación"
        description="Cree una nueva instalación deportiva para el polideportivo."
        submitLabel="Crear Instalación"
        formData={newForm}
        onFormChange={setNewForm}
        onSubmit={handleCreate}
      />

      {/* Modal: Editar info */}
      <InstalacionFormDialog
        open={!!editingId}
        onOpenChange={(open) => !open && setEditingId(null)}
        title="Editar Información de la Instalación"
        description="Modifique nombre, descripción, precio y duración."
        submitLabel="Guardar Cambios"
        formData={editForm}
        onFormChange={setEditForm}
        onSubmit={handleEditInfoSubmit}
      />

      {/* Modal: Horarios conectado al backend */}
      {horarioTargetId != null && (
        <HorarioDialog
          open={horarioTargetId != null}
          instalacionId={horarioTargetId}
          nombreInstalacion={horarioTargetName}
          initialPlantillas={plantillas.filter(
            (p) => String(p.idInstalacion) === String(horarioTargetId)
          )}
          onSaved={loadPlantillas}
          onClose={() => setHorarioTargetId(null)}
        />
      )}
    </div>
  );
}

export default InstalacionesPage;
