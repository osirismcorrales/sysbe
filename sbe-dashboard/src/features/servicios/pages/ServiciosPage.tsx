import React, { useState } from 'react';
import { useData, type Servicio } from '../../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { Dumbbell, Plus, Edit, Clock, Users, Trash2, Copy } from 'lucide-react';
import { cn } from '../../../lib/utils';

// --- HORARIO TYPES ---
interface HorarioDia {
  habilitado: boolean;
  horaInicio: string;
  horaFin: string;
}

interface HorarioServicio {
  servicioId: string;
  dias: Record<string, HorarioDia>;
}

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const defaultHorario = (): Record<string, HorarioDia> => {
  const dias: Record<string, HorarioDia> = {};
  DIAS_SEMANA.forEach((dia) => {
    dias[dia] = {
      habilitado: dia !== 'Domingo',
      horaInicio: '08:00',
      horaFin: '21:00'
    };
  });
  return dias;
};

export function ServiciosPage() {
  const { servicios, updateServicioEstado } = useData();
  const [serviciosList, setServiciosList] = useState<Servicio[]>(servicios);

  // --- MODAL STATES ---
  const [isNewServicioOpen, setIsNewServicioOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [editingHorario, setEditingHorario] = useState<Servicio | null>(null);

  // Schedule data stored per-service (keyed by service id)
  const [horariosMap, setHorariosMap] = useState<Record<string, Record<string, HorarioDia>>>(() => {
    const map: Record<string, Record<string, HorarioDia>> = {};
    servicios.forEach(s => { map[s.id] = defaultHorario(); });
    return map;
  });

  // Current horario being edited in the modal
  const [currentHorario, setCurrentHorario] = useState<Record<string, HorarioDia>>(defaultHorario());

  // --- NEW SERVICE FORM ---
  const [newServicioForm, setNewServicioForm] = useState({
    nombre: '',
    descripcion: '',
    precioBase: 0,
    capacidadMax: 10,
    estado: 'Habilitada' as Servicio['estado']
  });

  // --- EDIT INFO FORM ---
  const [editServicioForm, setEditServicioForm] = useState({
    nombre: '',
    descripcion: '',
    precioBase: 0,
    capacidadMax: 10,
    estado: 'Habilitada' as Servicio['estado']
  });

  // --- HANDLERS ---

  const handleCreateServicio = (e: React.FormEvent) => {
    e.preventDefault();
    const newServicio: Servicio = {
      id: `ser-${Date.now()}`,
      ...newServicioForm
    };
    servicios.push(newServicio);
    setServiciosList([...servicios]);
    setHorariosMap(prev => ({ ...prev, [newServicio.id]: defaultHorario() }));
    setIsNewServicioOpen(false);
    setNewServicioForm({ nombre: '', descripcion: '', precioBase: 0, capacidadMax: 10, estado: 'Habilitada' });
  };

  // Open Edit Info modal
  const handleEditInfoClick = (servicio: Servicio) => {
    setEditingServicio(servicio);
    setEditServicioForm({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precioBase: servicio.precioBase,
      capacidadMax: servicio.capacidadMax,
      estado: servicio.estado
    });
  };

  const handleEditInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingServicio) return;
    const index = servicios.findIndex(s => s.id === editingServicio.id);
    if (index !== -1) {
      servicios[index] = { ...editingServicio, ...editServicioForm };
      setServiciosList([...servicios]);
    }
    setEditingServicio(null);
  };

  // Open Edit Horario modal
  const handleEditHorarioClick = (servicio: Servicio) => {
    setEditingHorario(servicio);
    // Load existing schedule or create default
    setCurrentHorario(
      horariosMap[servicio.id]
        ? JSON.parse(JSON.stringify(horariosMap[servicio.id]))
        : defaultHorario()
    );
  };

  const handleHorarioChange = (dia: string, field: keyof HorarioDia, value: string | boolean) => {
    setCurrentHorario(prev => ({
      ...prev,
      [dia]: { ...prev[dia], [field]: value }
    }));
  };

  // Copy schedule from one day to all weekdays
  const handleCopyToWeekdays = (sourceDia: string) => {
    const source = currentHorario[sourceDia];
    setCurrentHorario(prev => {
      const updated = { ...prev };
      ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].forEach(d => {
        updated[d] = { ...source };
      });
      return updated;
    });
  };

  const handleSaveHorario = () => {
    if (!editingHorario) return;
    setHorariosMap(prev => ({
      ...prev,
      [editingHorario.id]: currentHorario
    }));
    setEditingHorario(null);
  };

  // Change status quickly from card
  const handleStatusChange = (id: string, estado: Servicio['estado']) => {
    updateServicioEstado(id, estado);
    const index = servicios.findIndex(s => s.id === id);
    if (index !== -1) {
      servicios[index].estado = estado;
      setServiciosList([...servicios]);
    }
  };

  // Helper: get summary of enabled days for a service
  const getHorarioSummary = (servicioId: string): string => {
    const horario = horariosMap[servicioId];
    if (!horario) return 'Sin configurar';
    const enabledDays = DIAS_SEMANA.filter(d => horario[d]?.habilitado);
    if (enabledDays.length === 0) return 'Cerrado';
    if (enabledDays.length === 7) return 'Todos los días';
    if (enabledDays.length === 6 && !horario['Domingo']?.habilitado) return 'Lun a Sáb';
    if (enabledDays.length === 5 && !horario['Sábado']?.habilitado && !horario['Domingo']?.habilitado) return 'Lun a Vie';
    return `${enabledDays.length} días`;
  };

  const getHorarioHours = (servicioId: string): string => {
    const horario = horariosMap[servicioId];
    if (!horario) return '';
    const firstEnabled = DIAS_SEMANA.find(d => horario[d]?.habilitado);
    if (!firstEnabled) return '';
    return `${horario[firstEnabled].horaInicio} - ${horario[firstEnabled].horaFin}`;
  };

  return (
    <div className="space-y-6 select-none text-xs">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 border border-gray-200 rounded-xl shadow-xs">
        <span className="font-semibold text-gray-500">Gestione los servicios, horarios y disponibilidades del Polideportivo</span>
        <Button
          onClick={() => setIsNewServicioOpen(true)}
          variant="brand"
          size="sm"
          className="flex items-center gap-1.5 font-semibold text-xs rounded-lg shadow-xs h-8 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nuevo Servicio
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {serviciosList.map((servicio) => (
          <Card key={servicio.id} className="hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-red-50 rounded-lg text-brand-red">
                    <Dumbbell className="h-4 w-4" />
                  </div>
                  {servicio.nombre}
                </CardTitle>
              </div>
              <Badge
                variant={
                  servicio.estado === 'Habilitada'
                    ? 'success'
                    : servicio.estado === 'Mantenimiento'
                    ? 'warning'
                    : 'destructive'
                }
                className="text-[9px] font-bold px-2 py-0.5"
              >
                {servicio.estado}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3 py-3 flex-1">
              <p className="text-gray-500 font-medium leading-relaxed">
                {servicio.descripcion}
              </p>

              {/* Schedule summary row */}
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold bg-gray-50 rounded-lg px-3 py-2">
                <Clock className="h-3.5 w-3.5 text-gray-300" />
                <span>{getHorarioSummary(servicio.id)}</span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-500">{getHorarioHours(servicio.id)}</span>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-[10px] text-gray-400 font-bold">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-300" />
                  Máx: {servicio.capacidadMax} personas
                </span>
                <span className="text-xs font-black text-gray-900">
                  ${servicio.precioBase.toLocaleString('es-AR')} / hs
                </span>
              </div>
            </CardContent>

            <CardFooter className="bg-gray-50/50 p-4 border-t border-gray-100 flex flex-col gap-3">
              {/* Estado selector row */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400">Estado:</span>
                  <select
                    value={servicio.estado}
                    onChange={(e) => handleStatusChange(servicio.id, e.target.value as Servicio['estado'])}
                    className={cn(
                      "h-7 px-1.5 border rounded-md text-[10px] font-bold cursor-pointer focus:outline-none",
                      servicio.estado === 'Habilitada'
                        ? "text-green-700 border-green-200 bg-green-50/50"
                        : servicio.estado === 'Mantenimiento'
                        ? "text-amber-700 border-amber-200 bg-amber-50/50"
                        : "text-red-700 border-red-200 bg-red-50/50"
                    )}
                  >
                    <option value="Habilitada">Habilitada</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Deshabilitada">Deshabilitada</option>
                  </select>
                </div>
              </div>

              {/* Action buttons row */}
              <div className="flex items-center gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditHorarioClick(servicio)}
                  className="flex-1 h-8 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Editar Horarios
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditInfoClick(servicio)}
                  className="flex-1 h-8 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Editar Info
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* ====================== */}
      {/* NEW SERVICE MODAL      */}
      {/* ====================== */}
      <Dialog open={isNewServicioOpen} onOpenChange={setIsNewServicioOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Servicio</DialogTitle>
            <DialogDescription>
              Cree una nueva actividad o instalación deportiva para el polideportivo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateServicio} className="space-y-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Nombre del Servicio</label>
              <input
                type="text"
                placeholder="Ej. Cancha de Paddle"
                value={newServicioForm.nombre}
                onChange={(e) => setNewServicioForm({ ...newServicioForm, nombre: e.target.value })}
                className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Descripción</label>
              <textarea
                placeholder="Detalle el servicio..."
                value={newServicioForm.descripcion}
                onChange={(e) => setNewServicioForm({ ...newServicioForm, descripcion: e.target.value })}
                className="h-20 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Precio de Alquiler ($/hs)</label>
                <input
                  type="number"
                  value={newServicioForm.precioBase}
                  onChange={(e) => setNewServicioForm({ ...newServicioForm, precioBase: Number(e.target.value) })}
                  className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Capacidad Máxima</label>
                <input
                  type="number"
                  value={newServicioForm.capacidadMax}
                  onChange={(e) => setNewServicioForm({ ...newServicioForm, capacidadMax: Number(e.target.value) })}
                  className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Estado Inicial</label>
              <select
                value={newServicioForm.estado}
                onChange={(e) => setNewServicioForm({ ...newServicioForm, estado: e.target.value as Servicio['estado'] })}
                className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              >
                <option value="Habilitada">Habilitada</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Deshabilitada">Deshabilitada</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewServicioOpen(false)} className="text-xs">
                Cancelar
              </Button>
              <Button type="submit" variant="brand" size="sm" className="text-xs font-semibold">
                Crear Servicio
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ====================== */}
      {/* EDIT INFO MODAL        */}
      {/* ====================== */}
      {editingServicio && (
        <Dialog open={!!editingServicio} onOpenChange={(open) => !open && setEditingServicio(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Información del Servicio</DialogTitle>
              <DialogDescription>
                Modifique nombre, descripción, precio y capacidad de <span className="font-bold">{editingServicio.nombre}</span>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditInfoSubmit} className="space-y-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Nombre del Servicio</label>
                <input
                  type="text"
                  value={editServicioForm.nombre}
                  onChange={(e) => setEditServicioForm({ ...editServicioForm, nombre: e.target.value })}
                  className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Descripción</label>
                <textarea
                  value={editServicioForm.descripcion}
                  onChange={(e) => setEditServicioForm({ ...editServicioForm, descripcion: e.target.value })}
                  className="h-20 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-700">Precio de Alquiler ($/hs)</label>
                  <input
                    type="number"
                    value={editServicioForm.precioBase}
                    onChange={(e) => setEditServicioForm({ ...editServicioForm, precioBase: Number(e.target.value) })}
                    className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-700">Capacidad Máxima</label>
                  <input
                    type="number"
                    value={editServicioForm.capacidadMax}
                    onChange={(e) => setEditServicioForm({ ...editServicioForm, capacidadMax: Number(e.target.value) })}
                    className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Estado</label>
                <select
                  value={editServicioForm.estado}
                  onChange={(e) => setEditServicioForm({ ...editServicioForm, estado: e.target.value as Servicio['estado'] })}
                  className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                >
                  <option value="Habilitada">Habilitada</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Deshabilitada">Deshabilitada</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingServicio(null)} className="text-xs">
                  Cancelar
                </Button>
                <Button type="submit" variant="brand" size="sm" className="text-xs font-semibold">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ====================== */}
      {/* EDIT HORARIOS MODAL    */}
      {/* ====================== */}
      {editingHorario && (
        <Dialog open={!!editingHorario} onOpenChange={(open) => !open && setEditingHorario(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Configurar Horarios — {editingHorario.nombre}
              </DialogTitle>
              <DialogDescription>
                Defina los días y franjas horarias en que este servicio estará disponible para reservar.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1 mt-2">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_60px_100px_100px_40px] gap-2 items-center px-2 py-1.5 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase">
                <span>Día</span>
                <span className="text-center">Abierto</span>
                <span className="text-center">Apertura</span>
                <span className="text-center">Cierre</span>
                <span></span>
              </div>

              {/* Day rows */}
              {DIAS_SEMANA.map((dia) => (
                <div
                  key={dia}
                  className={cn(
                    "grid grid-cols-[1fr_60px_100px_100px_40px] gap-2 items-center px-2 py-2 rounded-lg transition-colors",
                    currentHorario[dia]?.habilitado
                      ? "bg-white"
                      : "bg-gray-50 opacity-60"
                  )}
                >
                  {/* Day name */}
                  <span className={cn(
                    "font-bold text-xs",
                    currentHorario[dia]?.habilitado ? "text-gray-900" : "text-gray-400"
                  )}>
                    {dia}
                  </span>

                  {/* Toggle */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleHorarioChange(dia, 'habilitado', !currentHorario[dia]?.habilitado)}
                      className={cn(
                        "w-9 h-5 rounded-full transition-colors cursor-pointer relative",
                        currentHorario[dia]?.habilitado ? "bg-green-500" : "bg-gray-300"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                          currentHorario[dia]?.habilitado ? "translate-x-4.5" : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </div>

                  {/* Start time */}
                  <input
                    type="time"
                    value={currentHorario[dia]?.horaInicio || '08:00'}
                    onChange={(e) => handleHorarioChange(dia, 'horaInicio', e.target.value)}
                    disabled={!currentHorario[dia]?.habilitado}
                    className="h-7 px-2 border border-gray-200 rounded-md text-[10px] font-semibold text-center focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:bg-gray-100 disabled:text-gray-300"
                  />

                  {/* End time */}
                  <input
                    type="time"
                    value={currentHorario[dia]?.horaFin || '21:00'}
                    onChange={(e) => handleHorarioChange(dia, 'horaFin', e.target.value)}
                    disabled={!currentHorario[dia]?.habilitado}
                    className="h-7 px-2 border border-gray-200 rounded-md text-[10px] font-semibold text-center focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:bg-gray-100 disabled:text-gray-300"
                  />

                  {/* Copy to weekdays */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      title={`Copiar horario de ${dia} a Lun-Vie`}
                      onClick={() => handleCopyToWeekdays(dia)}
                      className="text-gray-300 hover:text-blue-600 transition-colors cursor-pointer p-1 rounded"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tip */}
            <p className="text-[10px] text-gray-400 font-medium mt-2 px-2">
              💡 Haga clic en el ícono <Copy className="inline h-3 w-3" /> para copiar el horario de un día a todos los días de semana (Lun-Vie).
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingHorario(null)} className="text-xs">
                Cancelar
              </Button>
              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={handleSaveHorario}
                className="text-xs font-semibold flex items-center gap-1.5"
              >
                <Clock className="h-3.5 w-3.5" />
                Guardar Horarios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
export default ServiciosPage;
