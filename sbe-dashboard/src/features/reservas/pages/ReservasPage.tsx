/**
 * ReservasPage.tsx
 * Componente contenedor (smart component) para la gestión de reservas.
 * Conecta con el backend via useReservas y delega la presentación a componentes tontos.
 */

import React, { useState } from 'react';
import { useReservas, type ReservaResponseDto } from '../hooks/useReservas';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { CalendarDays, Plus, RefreshCw, AlertCircle, Loader2, Search } from 'lucide-react';

// Componentes presentacionales
import { ReservaTable } from '../components/ReservaTable';
import { ReservaFormDialog } from '../components/ReservaFormDialog';

// ─── Componente contenedor ──────────────────────────────────────────────────

export function ReservasPage() {
  const {
    reservas,
    usuarios,
    instalaciones,
    usuarioMap,
    instalacionMap,
    loading,
    error,
    refresh,
    crear,
    cancelar,
    reprogramar,
  } = useReservas();

  // ─── Filtros locales ──────────────────────────────────────────────────────

  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReservas = reservas.filter((r) => {
    // Filtro por estado
    const matchesEstado = estadoFilter === 'all' || r.estadoReserva === estadoFilter;

    // Filtro por búsqueda (nombre de usuario, nombre de instalación o fecha)
    const usuario = usuarioMap.get(r.idUsuario);
    const instalacion = instalacionMap.get(r.idInstalacion);
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (usuario?.nombreCompleto || '').toLowerCase().includes(searchLower) ||
      (usuario?.dni || '').includes(searchQuery) ||
      (instalacion?.nombre || '').toLowerCase().includes(searchLower) ||
      r.fechaReserva.includes(searchQuery);

    return matchesEstado && matchesSearch;
  });

  // ─── Modal: Crear reserva ─────────────────────────────────────────────────

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // ─── Modal: Reprogramar reserva ───────────────────────────────────────────

  const [reprogramarReserva, setReprogramarReserva] = useState<ReservaResponseDto | null>(null);

  // ─── Modal: Confirmar cancelación ─────────────────────────────────────────

  const [cancelTarget, setCancelTarget] = useState<ReservaResponseDto | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelar(cancelTarget.idReserva);
      setCancelTarget(null);
    } catch {
      // El error se propaga via el hook
    } finally {
      setCancelling(false);
    }
  };

  // ─── Conteos por estado ───────────────────────────────────────────────────

  const countByEstado = (estado: string) => reservas.filter((r) => r.estadoReserva === estado).length;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 select-none">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error al cargar reservas: {error}</span>
        </div>
      )}

      {/* Barra superior */}
      <Card>
        <CardContent className="py-4 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Izquierda: Info */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  {loading ? '…' : `${reservas.length} reservas`}
                </h2>
                <p className="text-[10px] text-gray-400 font-medium">
                  {countByEstado('RESERVADA')} activas · {countByEstado('CANCELADA')} canceladas · {countByEstado('FINALIZADA')} finalizadas
                </p>
              </div>
            </div>

            {/* Derecha: Acciones */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-3 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400 w-44"
                />
              </div>

              {/* Filtro por estado */}
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="h-8 px-3 text-xs border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="all">Todos los estados</option>
                <option value="RESERVADA">Reservadas</option>
                <option value="CANCELADA">Canceladas</option>
                <option value="REPROGRAMADA">Reprogramadas</option>
                <option value="FINALIZADA">Finalizadas</option>
                <option value="BLOQUEADA">Bloqueadas</option>
              </select>

              <Button
                size="sm"
                variant="outline"
                onClick={refresh}
                className="h-8 w-8 p-0 cursor-pointer"
                title="Actualizar"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </Button>

              <Button
                size="sm"
                variant="brand"
                onClick={() => setIsCreateOpen(true)}
                className="h-8 px-3 text-xs font-semibold cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Nueva Reserva
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de reservas */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
              <p className="text-xs font-medium">Cargando reservas…</p>
            </div>
          ) : (
            <ReservaTable
              reservas={filteredReservas}
              usuarioMap={usuarioMap}
              instalacionMap={instalacionMap}
              onCancelar={(r) => setCancelTarget(r)}
              onReprogramar={(r) => setReprogramarReserva(r)}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal: Crear Reserva */}
      <ReservaFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="crear"
        usuarios={usuarios}
        instalaciones={instalaciones}
        onCrear={crear}
        onReprogramar={reprogramar}
      />

      {/* Modal: Reprogramar Reserva */}
      <ReservaFormDialog
        open={reprogramarReserva != null}
        onOpenChange={(open) => { if (!open) setReprogramarReserva(null); }}
        mode="reprogramar"
        reserva={reprogramarReserva}
        usuarios={usuarios}
        instalaciones={instalaciones}
        onCrear={crear}
        onReprogramar={reprogramar}
      />

      {/* Modal: Confirmar Cancelación */}
      <Dialog open={cancelTarget != null} onOpenChange={(open) => { if (!open) setCancelTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Cancelar Reserva</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar la reserva #{cancelTarget?.idReserva}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelTarget(null)}
              disabled={cancelling}
              className="cursor-pointer"
            >
              No, mantener
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="cursor-pointer"
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Cancelando…
                </>
              ) : (
                'Sí, cancelar reserva'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReservasPage;
