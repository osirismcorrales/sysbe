/**
 * InstalacionesPage.tsx
 * Componente contenedor (smart component) que maneja estado y lógica.
 * Delega toda la presentación a los componentes tontos (dumb components).
 */

import React, { useState } from 'react';
import { useInstalaciones } from '../hooks/useInstalaciones';
import { Button } from '../../../components/ui/Button';
import { Plus, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

// Componentes presentacionales
import { InstalacionCard, type InstalacionCardData } from '../components/InstalacionCard';
import { InstalacionFormDialog, type InstalacionFormData } from '../components/InstalacionFormDialog';
import { HorarioDialog, type HorarioDia, DIAS_SEMANA } from '../components/HorarioDialog';

// ─── Helpers ────────────────────────────────────────────────────────────────

const EMPTY_FORM: InstalacionFormData = {
  nombre: '',
  descripcion: '',
  precioBase: 0,
  duracionMinutos: 60,
  estado: 'Habilitada',
};

const defaultHorario = (): Record<string, HorarioDia> => {
  const dias: Record<string, HorarioDia> = {};
  DIAS_SEMANA.forEach((dia) => {
    dias[dia] = {
      habilitado: dia !== 'Domingo',
      horaInicio: '08:00',
      horaFin: '21:00',
    };
  });
  return dias;
};

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

  // ─── Modal states ───────────────────────────────────────────────────────

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newForm, setNewForm] = useState<InstalacionFormData>({ ...EMPTY_FORM });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<InstalacionFormData>({ ...EMPTY_FORM });

  const [horarioTargetId, setHorarioTargetId] = useState<string | null>(null);
  const [horarioTargetName, setHorarioTargetName] = useState('');
  const [horariosMap, setHorariosMap] = useState<Record<string, Record<string, HorarioDia>>>({});
  const [currentHorario, setCurrentHorario] = useState<Record<string, HorarioDia>>(defaultHorario());

  // ─── Handlers: Crear ────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const nueva = await crear(newForm);
      setHorariosMap((prev) => ({ ...prev, [String(nueva.id)]: defaultHorario() }));
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
    setHorarioTargetId(instalacion.id);
    setHorarioTargetName(instalacion.nombre);
    setCurrentHorario(
      horariosMap[instalacion.id]
        ? JSON.parse(JSON.stringify(horariosMap[instalacion.id]))
        : defaultHorario()
    );
  };

  const handleHorarioChange = (dia: string, field: keyof HorarioDia, value: string | boolean) => {
    setCurrentHorario((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], [field]: value },
    }));
  };

  const handleCopyToWeekdays = (sourceDia: string) => {
    const source = currentHorario[sourceDia];
    setCurrentHorario((prev) => {
      const updated = { ...prev };
      ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].forEach((d) => {
        updated[d] = { ...source };
      });
      return updated;
    });
  };

  const handleSaveHorario = () => {
    if (!horarioTargetId) return;
    setHorariosMap((prev) => ({
      ...prev,
      [horarioTargetId]: currentHorario,
    }));
    setHorarioTargetId(null);
  };

  // ─── Handlers: Estado ───────────────────────────────────────────────────

  const handleStatusChange = async (id: string, estado: string) => {
    try {
      await cambiarEstado(Number(id), estado);
    } catch (err) {
      alert(`Error al cambiar estado: ${(err as Error).message}`);
    }
  };

  // ─── Helpers: resumen de horarios ───────────────────────────────────────

  const getHorarioSummary = (instalacionId: string): string => {
    const horario = horariosMap[instalacionId];
    if (!horario) return 'Sin configurar';
    const enabledDays = DIAS_SEMANA.filter((d) => horario[d]?.habilitado);
    if (enabledDays.length === 0) return 'Cerrado';
    if (enabledDays.length === 7) return 'Todos los días';
    if (enabledDays.length === 6 && !horario['Domingo']?.habilitado) return 'Lun a Sáb';
    if (enabledDays.length === 5 && !horario['Sábado']?.habilitado && !horario['Domingo']?.habilitado) return 'Lun a Vie';
    return `${enabledDays.length} días`;
  };

  const getHorarioHours = (instalacionId: string): string => {
    const horario = horariosMap[instalacionId];
    if (!horario) return '';
    const firstEnabled = DIAS_SEMANA.find((d) => horario[d]?.habilitado);
    if (!firstEnabled) return '';
    return `${horario[firstEnabled].horaInicio} - ${horario[firstEnabled].horaFin}`;
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
        <Button variant="outline" size="sm" onClick={refresh} className="flex items-center gap-1.5 text-xs">
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
      <div className="flex justify-between items-center bg-white p-4 border border-gray-200 rounded-xl shadow-xs">
        <span className="font-semibold text-gray-500">Gestione las instalaciones, horarios y disponibilidades del Polideportivo</span>
        <div className="flex items-center gap-2">
          <Button
            onClick={refresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 font-semibold text-xs rounded-lg shadow-xs h-8 cursor-pointer"
            title="Actualizar desde el servidor"
          >
            <RefreshCw className="h-3.5 w-3.5" />
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

      {/* Instalaciones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {instalacionesList.map((instalacion) => (
          <InstalacionCard
            key={instalacion.id}
            instalacion={instalacion}
            horarioSummary={getHorarioSummary(instalacion.id)}
            horarioHours={getHorarioHours(instalacion.id)}
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

      {/* Modal: Horarios */}
      {horarioTargetId && (
        <HorarioDialog
          open={!!horarioTargetId}
          nombreInstalacion={horarioTargetName}
          horario={currentHorario}
          onHorarioChange={handleHorarioChange}
          onCopyToWeekdays={handleCopyToWeekdays}
          onSave={handleSaveHorario}
          onClose={() => setHorarioTargetId(null)}
        />
      )}
    </div>
  );
}

export default InstalacionesPage;
