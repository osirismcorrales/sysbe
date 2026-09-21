/**
 * InstalacionesPage.tsx
 * Componente contenedor (smart component) que maneja estado y lógica.
 * Delega toda la presentación a los componentes tontos (dumb components).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useInstalaciones } from '../hooks/useInstalaciones';
import { Card, CardContent } from '../../../components/ui/Card';
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
  EMPTY_INSTALACION_FORM,
  type InstalacionFormData,
} from '../components/InstalacionFormDialog';
import type { InstalacionRequestDto } from '../services/instalacionesApi';
import { HorarioDialog } from '../components/HorarioDialog';
import { toast } from '../../../components/ui/Toast';
import {
  listarPlantillas,
  formatHora,
  calcDuracionHoras,
  DIAS_SEMANA_CONFIG,
  type DiaSemana,
  type PlantillaHorarioResponseDto,
} from '../services/plantillasHorarioApi';

// ─── Helpers ────────────────────────────────────────────────────────────────

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<InstalacionFormData>({ ...EMPTY_INSTALACION_FORM });

  const [horarioTargetId, setHorarioTargetId] = useState<number | null>(null);
  const [horarioTargetName, setHorarioTargetName] = useState('');

  // ─── Filtros locales ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('all');

  const filteredInstalaciones = instalacionesList.filter((inst) => {
    const matchesSearch =
      !searchQuery ||
      inst.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inst.descripcion && inst.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesEstado = estadoFilter === 'all' || inst.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  // ─── Handlers: Crear ────────────────────────────────────────────────────

  const handleCreate = async (data: InstalacionRequestDto) => {
    try {
      await crear(data);
      toast.success('Instalación creada exitosamente.');
    } catch (err) {
      toast.error((err as Error).message || 'Error al crear instalación.', 'Error');
      throw err;
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

  const handleEditInfoSubmit = async (data: InstalacionRequestDto) => {
    if (!editingId) return;
    try {
      await actualizar(Number(editingId), data);
      toast.success('Instalación actualizada exitosamente.');
      setEditingId(null);
    } catch (err) {
      toast.error((err as Error).message || 'Error al actualizar instalación.', 'Error');
      throw err;
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
      toast.success(`Estado cambiado a "${estado}".`);
    } catch (err) {
      toast.error((err as Error).message || 'Error al cambiar estado.', 'Error');
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
    <div className="space-y-4 select-none text-xs">
      {/* Barra de herramientas compacta y unificada */}
      <Card className="shadow-xs">
        <CardContent className="p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-gray-900 text-sm">Instalaciones</span>
            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
              {filteredInstalaciones.length} de {instalacionesList.length}
            </span>
          </div>

          <div className="flex flex-1 items-center gap-2 min-w-[200px] max-w-xl">
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-8 px-2.5 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium"
            />

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-semibold text-gray-500 text-[11px] whitespace-nowrap hidden sm:inline">Estado:</span>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="h-8 px-2 border border-gray-200 bg-white rounded-lg focus:outline-none text-xs font-semibold cursor-pointer max-w-[140px]"
              >
                <option value="all">Todos</option>
                <option value="Habilitada">Habilitada</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Deshabilitada">Deshabilitada</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              onClick={handleFullRefresh}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 flex items-center justify-center font-semibold rounded-lg shadow-xs cursor-pointer"
              title="Actualizar desde el servidor"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              onClick={() => setIsNewOpen(true)}
              variant="brand"
              size="sm"
              className="h-8 px-3 flex items-center gap-1 font-semibold text-xs rounded-lg shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Nueva Instalación</span>
              <span className="xs:hidden">Nueva</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instalaciones Grid */}
      {filteredInstalaciones.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 font-medium text-xs shadow-xs">
          No se encontraron instalaciones que coincidan con los filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredInstalaciones.map((instalacion) => (
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
      )}

      {/* Modal: Crear instalación */}
      <InstalacionFormDialog
        open={isNewOpen}
        onOpenChange={setIsNewOpen}
        title="Registrar Nueva Instalación"
        description="Cree una nueva instalación deportiva para el polideportivo."
        submitLabel="Crear Instalación"
        onSubmit={handleCreate}
      />

      {/* Modal: Editar info */}
      <InstalacionFormDialog
        open={!!editingId}
        onOpenChange={(open) => !open && setEditingId(null)}
        title="Editar Información de la Instalación"
        description="Modifique nombre, descripción, precio y duración."
        submitLabel="Guardar Cambios"
        initialValues={editForm}
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
