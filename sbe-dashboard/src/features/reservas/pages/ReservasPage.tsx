/**
 * ReservasPage.tsx
 * Componente contenedor (smart component) para la gestión de reservas.
 * Conecta con el backend via useReservas y delega la presentación a componentes tontos.
 */

import React, { useState } from 'react';
import { useReservas, type ReservaResponseDto } from '../hooks/useReservas';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { CalendarDays, Plus, RefreshCw, AlertCircle, Loader2, Search, Wallet, CheckCircle2 } from 'lucide-react';

// Componentes presentacionales
import { ReservaTable } from '../components/ReservaTable';
import { ReservaFormDialog } from '../components/ReservaFormDialog';
import { Pagination } from '../../../components/ui/Pagination';
import { toast } from '../../../components/ui/Toast';
import { PagoFormDialog, type PagoFormPrefill } from '../../pagos/components/PagoFormDialog';
import { crearPago, aprobarPago } from '../../pagos/services/pagosApi';
import {
  ESTADOS_PAGO,
  ESTADO_PAGO_LABELS,
  type EstadoPago,
  type PagoRequestDto,
  type PagoResponseDto,
} from '../../pagos/types/pagos.types';

type PagoFilter = 'all' | 'sin_pago' | EstadoPago;

// ─── Componente contenedor ──────────────────────────────────────────────────

export function ReservasPage() {
  const {
    reservas,
    usuarios,
    instalaciones,
    usuarioMap,
    instalacionMap,
    pagoPorReserva,
    loading,
    error,
    refresh,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalElements,
    crear,
    cancelar,
    reprogramar,
  } = useReservas();

  // ─── Filtros locales ──────────────────────────────────────────────────────

  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [pagoFilter, setPagoFilter] = useState<PagoFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReservas = reservas.filter((r) => {
    // Filtro por estado
    const matchesEstado = estadoFilter === 'all' || r.estadoReserva === estadoFilter;

    // Filtro por estado de pago
    const pago = pagoPorReserva.get(r.idReserva);
    const matchesPago =
      pagoFilter === 'all' ||
      (pagoFilter === 'sin_pago' ? !pago : pago?.estadoPago === pagoFilter);

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

    return matchesEstado && matchesPago && matchesSearch;
  });

  // ─── Modal: Crear reserva ─────────────────────────────────────────────────

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // ─── Modal: Reprogramar reserva ───────────────────────────────────────────

  const [reprogramarReserva, setReprogramarReserva] = useState<ReservaResponseDto | null>(null);

  // ─── Modal: Registrar pago de una reserva ─────────────────────────────────

  const [pagoFormReserva, setPagoFormReserva] = useState<ReservaResponseDto | null>(null);

  const pagoPrefill: PagoFormPrefill | null = pagoFormReserva
    ? {
        idUsuario: pagoFormReserva.idUsuario,
        idReserva: pagoFormReserva.idReserva,
        montoPago: Number(pagoFormReserva.montoReserva),
        tipoPago: 'RESERVA',
      }
    : null;

  const handleCrearPago = async (body: PagoRequestDto): Promise<PagoResponseDto> => {
    const nuevo = await crearPago(body);
    toast.success(`Pago #${nuevo.idPago} registrado para la reserva #${body.idReserva}.`);
    refresh();
    return nuevo;
  };

  // ─── Modal: Aprobar pago pendiente ────────────────────────────────────────

  const [pagoAprobarTarget, setPagoAprobarTarget] = useState<{
    reserva: ReservaResponseDto;
    pago: PagoResponseDto;
  } | null>(null);
  const [aprobandoPago, setAprobandoPago] = useState(false);

  const handleConfirmAprobarPago = async () => {
    if (!pagoAprobarTarget) return;
    setAprobandoPago(true);
    try {
      await aprobarPago(pagoAprobarTarget.pago.idPago);
      toast.success(`Pago #${pagoAprobarTarget.pago.idPago} aprobado correctamente.`);
      setPagoAprobarTarget(null);
      refresh();
    } catch (err) {
      toast.error((err as Error).message || 'Error al aprobar el pago.', 'Error');
    } finally {
      setAprobandoPago(false);
    }
  };

  // ─── Modal: Confirmar cancelación ─────────────────────────────────────────

  const [cancelTarget, setCancelTarget] = useState<ReservaResponseDto | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelar(cancelTarget.idReserva);
      toast.success('Reserva cancelada con éxito.');
      setCancelTarget(null);
    } catch (err) {
      toast.error((err as Error).message || 'Error al cancelar la reserva.', 'Error');
    } finally {
      setCancelling(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 select-none text-xs">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error al cargar reservas: {error}</span>
        </div>
      )}

      {/* Barra superior compacta y unificada */}
      <Card className="shadow-xs">
        <CardContent className="p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2.5">
          {/* Izquierda: Info */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Reservas</span>
            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
              {totalElements} {totalElements === 1 ? 'reserva' : 'reservas'}
            </span>
          </div>

          {/* Centro: Buscador y Filtros */}
          <div className="flex flex-1 items-center gap-2 min-w-[200px] max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuario, instalación o fecha…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400 font-medium"
              />
            </div>

            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="h-8 px-2 text-xs border border-gray-200 bg-white rounded-lg focus:outline-none cursor-pointer shrink-0 font-medium max-w-[140px] sm:max-w-none"
              title="Filtrar por estado de reserva"
            >
              <option value="all">Todos los estados</option>
              <option value="RESERVADA">Reservadas</option>
              <option value="CANCELADA">Canceladas</option>
              <option value="REPROGRAMADA">Reprogramadas</option>
              <option value="FINALIZADA">Finalizadas</option>
              <option value="BLOQUEADA">Bloqueadas</option>
            </select>

            <select
              value={pagoFilter}
              onChange={(e) => setPagoFilter(e.target.value as PagoFilter)}
              className="h-8 px-2 text-xs border border-gray-200 bg-white rounded-lg focus:outline-none cursor-pointer shrink-0 font-medium max-w-[160px]"
              title="Filtrar por estado de pago"
            >
              <option value="all">Todos los pagos</option>
              <option value="sin_pago">Sin pago</option>
              {ESTADOS_PAGO.map((estado) => (
                <option key={estado} value={estado}>
                  {ESTADO_PAGO_LABELS[estado]}
                </option>
              ))}
            </select>
          </div>

          {/* Derecha: Acciones */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={refresh}
              className="h-8 w-8 p-0 cursor-pointer shrink-0"
              title="Actualizar"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>

            <Button
              size="sm"
              variant="brand"
              onClick={() => setIsCreateOpen(true)}
              className="h-8 px-3 text-xs font-semibold cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span className="hidden xs:inline">Nueva Reserva</span>
              <span className="xs:hidden">Nueva</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de reservas */}
      <Card className="shadow-xs overflow-hidden border-gray-200 bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
              <p className="text-xs font-medium">Cargando reservas…</p>
            </div>
          ) : (
            <>
              <ReservaTable
                reservas={filteredReservas}
                usuarioMap={usuarioMap}
                instalacionMap={instalacionMap}
                pagoPorReserva={pagoPorReserva}
                onCancelar={(r) => setCancelTarget(r)}
                onReprogramar={(r) => setReprogramarReserva(r)}
                onRegistrarPago={(r) => setPagoFormReserva(r)}
                onAprobarPago={(reserva, pago) => setPagoAprobarTarget({ reserva, pago })}
              />
              <Pagination
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={size}
                onPageChange={setPage}
                onPageSizeChange={setSize}
                disabled={loading}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal: Crear Reserva */}
      <ReservaFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="crear"
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
        instalaciones={instalaciones}
        onCrear={crear}
        onReprogramar={reprogramar}
      />

      {/* Modal: Registrar Pago de una reserva */}
      <PagoFormDialog
        open={pagoFormReserva != null}
        onOpenChange={(open) => {
          if (!open) setPagoFormReserva(null);
        }}
        usuarios={usuarios}
        prefill={pagoPrefill}
        onCrear={handleCrearPago}
      />

      {/* Modal: Confirmar aprobación de pago pendiente */}
      <Dialog
        open={pagoAprobarTarget != null}
        onOpenChange={(open) => {
          if (!open && !aprobandoPago) setPagoAprobarTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-700">
              <CheckCircle2 className="h-5 w-5" />
              Aprobar pago pendiente
            </DialogTitle>
            <DialogDescription>
              La reserva #{pagoAprobarTarget?.reserva.idReserva} tiene el pago #
              {pagoAprobarTarget?.pago.idPago} pendiente por{' '}
              ${Number(pagoAprobarTarget?.pago.montoPago ?? 0).toLocaleString('es-AR', {
                minimumFractionDigits: 2,
              })}
              . ¿Confirmás que el pago fue recibido y querés aprobarlo?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagoAprobarTarget(null)}
              disabled={aprobandoPago}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={handleConfirmAprobarPago}
              disabled={aprobandoPago}
              className="cursor-pointer"
            >
              {aprobandoPago ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Aprobando…
                </>
              ) : (
                <>
                  <Wallet className="h-3.5 w-3.5 mr-1" />
                  Sí, aprobar pago
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
