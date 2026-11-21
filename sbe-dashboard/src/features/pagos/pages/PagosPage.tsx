/**
 * PagosPage.tsx
 * Componente contenedor (smart component) para la gestión de pagos.
 * Conecta con el backend via usePagos y delega la presentación a componentes tontos.
 *
 * Funcionalidades:
 *  - Listado paginado de pagos (Spring Data Pageable) con filtros por usuario, estado y tipo.
 *  - Registro de nuevos pagos (reserva o cuota de membresía).
 *  - Aprobación, rechazo y anulación de pagos usando los endpoints del PagoController.
 */

import React, { useState } from 'react';
import {
  usePagos,
  type PagoRequestDto,
  type PagoResponseDto,
} from '../hooks/usePagos';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Pagination } from '../../../components/ui/Pagination';
import { toast } from '../../../components/ui/Toast';
import {
  AlertCircle,
  FilterX,
  Loader2,
  Plus,
  RefreshCw,
  Wallet,
} from 'lucide-react';

// Componentes presentacionales
import { PagoTable } from '../components/PagoTable';
import { PagoFormDialog } from '../components/PagoFormDialog';
import { UsuarioSearchSelect } from '../../usuarios/components/UsuarioSearchSelect';
import { ConfirmarRechazoDialog } from '../components/ConfirmarRechazoDialog';
import { ConfirmarAnulacionDialog } from '../components/ConfirmarAnulacionDialog';

import {
  ESTADOS_PAGO,
  ESTADO_PAGO_LABELS,
  TIPOS_PAGO,
  TIPO_PAGO_LABELS,
  type EstadoPago,
  type TipoPago,
} from '../types/pagos.types';

// ─── Componente contenedor ──────────────────────────────────────────────────

export function PagosPage() {
  const {
    pagos,
    usuarios,
    filtros,
    setIdUsuario,
    setEstadoPago,
    setTipoPago,
    limpiarFiltros,
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
    aprobar,
    rechazar,
    anular,
  } = usePagos();

  // ─── Modal: Registrar pago ────────────────────────────────────────────────

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // ─── Acción: Aprobar pago ─────────────────────────────────────────────────

  const [approvingId, setApprovingId] = useState<number | null>(null);

  const handleAprobar = async (pago: PagoResponseDto) => {
    setApprovingId(pago.idPago);
    try {
      await aprobar(pago.idPago);
      toast.success(`Pago #${pago.idPago} aprobado correctamente.`);
    } catch (err) {
      toast.error((err as Error).message || 'Error al aprobar el pago.', 'Error');
    } finally {
      setApprovingId(null);
    }
  };

  // ─── Modal: Confirmar rechazo ─────────────────────────────────────────────

  const [rechazoTarget, setRechazoTarget] = useState<PagoResponseDto | null>(null);
  const [rechazando, setRechazando] = useState(false);

  const handleConfirmRechazo = async () => {
    if (!rechazoTarget) return;
    setRechazando(true);
    try {
      await rechazar(rechazoTarget.idPago);
      toast.success(`Pago #${rechazoTarget.idPago} rechazado correctamente.`);
      setRechazoTarget(null);
    } catch (err) {
      toast.error((err as Error).message || 'Error al rechazar el pago.', 'Error');
    } finally {
      setRechazando(false);
    }
  };

  // ─── Modal: Confirmar anulación ───────────────────────────────────────────

  const [anulacionTarget, setAnulacionTarget] = useState<PagoResponseDto | null>(null);
  const [anulando, setAnulando] = useState(false);

  const handleConfirmAnulacion = async () => {
    if (!anulacionTarget) return;
    setAnulando(true);
    try {
      await anular(anulacionTarget.idPago);
      toast.success(`Pago #${anulacionTarget.idPago} anulado correctamente.`);
      setAnulacionTarget(null);
    } catch (err) {
      toast.error((err as Error).message || 'Error al anular el pago.', 'Error');
    } finally {
      setAnulando(false);
    }
  };

  // ─── Handler: Registrar pago ──────────────────────────────────────────────

  const handleCrear = async (body: PagoRequestDto): Promise<PagoResponseDto> => {
    const nuevo = await crear(body);
    toast.success(`Pago #${nuevo.idPago} registrado correctamente.`);
    return nuevo;
  };

  // ─── Filtros activos ──────────────────────────────────────────────────────

  const hayFiltros =
    filtros.idUsuario !== 'all' ||
    filtros.estadoPago !== 'all' ||
    filtros.tipoPago !== 'all';

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 select-none text-xs">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error al cargar pagos: {error}</span>
        </div>
      )}

      {/* Barra superior compacta y unificada */}
      <Card className="shadow-xs">
        <CardContent className="p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2.5">
          {/* Izquierda: Info */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Wallet className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Pagos</span>
            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
              {totalElements} {totalElements === 1 ? 'pago' : 'pagos'}
            </span>
          </div>

          {/* Centro: Filtros del backend */}
          <div className="flex flex-1 items-center gap-2 min-w-[220px] max-w-2xl flex-wrap">
            <UsuarioSearchSelect
              value={filtros.idUsuario}
              onChange={setIdUsuario}
              className="w-[210px] max-w-[240px]"
              title="Filtrar por usuario (buscar por DNI o nombre)"
            />

            <select
              value={filtros.estadoPago}
              onChange={(e) => setEstadoPago(e.target.value as EstadoPago | 'all')}
              className="h-8 px-2 text-xs border border-gray-200 bg-white rounded-lg focus:outline-none cursor-pointer shrink-0 font-medium max-w-[150px]"
              title="Filtrar por estado"
            >
              <option value="all">Todos los estados</option>
              {ESTADOS_PAGO.map((estado) => (
                <option key={estado} value={estado}>
                  {ESTADO_PAGO_LABELS[estado]}
                </option>
              ))}
            </select>

            <select
              value={filtros.tipoPago}
              onChange={(e) => setTipoPago(e.target.value as TipoPago | 'all')}
              className="h-8 px-2 text-xs border border-gray-200 bg-white rounded-lg focus:outline-none cursor-pointer shrink-0 font-medium max-w-[165px]"
              title="Filtrar por tipo de pago"
            >
              <option value="all">Todos los tipos</option>
              {TIPOS_PAGO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {TIPO_PAGO_LABELS[tipo]}
                </option>
              ))}
            </select>

            {hayFiltros && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={limpiarFiltros}
                className="h-8 px-2 text-[11px] font-semibold text-gray-500 hover:text-gray-900 cursor-pointer shrink-0"
                title="Limpiar filtros"
              >
                <FilterX className="h-3.5 w-3.5 mr-1" />
                Limpiar
              </Button>
            )}
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
              <span className="hidden xs:inline">Nuevo Pago</span>
              <span className="xs:hidden">Nuevo</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de pagos */}
      <Card className="shadow-xs overflow-hidden border-gray-200 bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
              <p className="text-xs font-medium">Cargando pagos…</p>
            </div>
          ) : (
            <>
              <PagoTable
                pagos={pagos}
                onAprobar={handleAprobar}
                onRechazar={(pago) => setRechazoTarget(pago)}
                onAnular={(pago) => setAnulacionTarget(pago)}
                processingId={approvingId}
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

      {/* Modal: Registrar Pago */}
      <PagoFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        usuarios={usuarios}
        onCrear={handleCrear}
      />

      {/* Modal: Confirmar Rechazo */}
      <ConfirmarRechazoDialog
        open={rechazoTarget != null}
        onOpenChange={(open) => {
          if (!open && !rechazando) setRechazoTarget(null);
        }}
        pago={rechazoTarget}
        loading={rechazando}
        onConfirm={handleConfirmRechazo}
      />

      {/* Modal: Confirmar Anulación */}
      <ConfirmarAnulacionDialog
        open={anulacionTarget != null}
        onOpenChange={(open) => {
          if (!open && !anulando) setAnulacionTarget(null);
        }}
        pago={anulacionTarget}
        loading={anulando}
        onConfirm={handleConfirmAnulacion}
      />
    </div>
  );
}

export default PagosPage;
