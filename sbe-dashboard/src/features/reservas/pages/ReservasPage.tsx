import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useData, type Reserva, type Socio } from '../../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { CalendarDays, Clock, Plus, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

export function ReservasPage() {
  const { reservas, socios, servicios, addReserva, updateReserva, updateSocio } = useData();
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();

  // Page States
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals States
  const [isNewReservaOpen, setIsNewReservaOpen] = useState(false);
  const [reprogrammingReserva, setReprogrammingReserva] = useState<Reserva | null>(null);
  const [cancellationError, setCancellationError] = useState<string | null>(null);

  // New Reserva Form State
  const [newReservaForm, setNewReservaForm] = useState({
    usuarioDni: '',
    servicioId: '',
    fecha: '',
    horario: '08:00',
    estado: 'Pendiente' as Reserva['estado']
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Reprogram Form State
  const [reprogramForm, setReprogramForm] = useState({
    fecha: '',
    horario: ''
  });
  const [reprogramError, setReprogramError] = useState<string | null>(null);

  // Helper to check 48-hour rule
  const isAtLeast48HoursAway = (fechaStr: string, horarioStr: string): boolean => {
    const now = new Date();
    const targetDateTime = new Date(`${fechaStr}T${horarioStr}`);
    const diffMs = targetDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 48;
  };

  // Create Reserva Submit
  const handleCreateReserva = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const { usuarioDni, servicioId, fecha, horario, estado } = newReservaForm;

    if (!usuarioDni || !servicioId || !fecha || !horario) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }

    // 1. Validate 48 hours in advance (RS-4.2)
    if (!isAtLeast48HoursAway(fecha, horario)) {
      setFormError('Las reservas deben realizarse con un mínimo de 48 horas de anticipación.');
      return;
    }

    // 2. Validate availability (RS-7.3)
    const isAlreadyBooked = reservas.some(
      (r) =>
        r.servicioId === servicioId &&
        r.fecha === fecha &&
        r.horario === horario &&
        r.estado !== 'Cancelado'
    );

    if (isAlreadyBooked) {
      setFormError('El horario seleccionado ya está reservado para este servicio.');
      return;
    }

    const socio = socios.find((s) => s.dni === usuarioDni);
    if (!socio) {
      setFormError('Socio no encontrado.');
      return;
    }

    const servicio = servicios.find((s) => s.id === servicioId);
    if (!servicio) {
      setFormError('Servicio no encontrado.');
      return;
    }

    if (servicio.estado === 'Mantenimiento') {
      setFormError('El servicio seleccionado se encuentra en mantenimiento.');
      return;
    }

    addReserva({
      usuarioDni: socio.dni,
      usuarioNombre: socio.nombre,
      servicioId: servicio.id,
      servicioNombre: servicio.nombre,
      fecha,
      horario,
      tipoUsuario: socio.categoria,
      estado,
      monto: servicio.precioBase
    });

    setIsNewReservaOpen(false);
    setNewReservaForm({
      usuarioDni: '',
      servicioId: '',
      fecha: '',
      horario: '08:00',
      estado: 'Pendiente'
    });
  };

  // Cancel Reserva (RS-5.1 / RS-3.5)
  const handleCancelReserva = (reserva: Reserva) => {
    setCancellationError(null);

    // Validate 48 hours rule for cancellation (RS-5.1)
    if (!isAtLeast48HoursAway(reserva.fecha, reserva.horario)) {
      setCancellationError(
        `No se puede cancelar la reserva. Faltan menos de 48 horas para el servicio (${reserva.servicioNombre} - ${reserva.fecha.split('-').reverse().join('/')} ${reserva.horario} hs).`
      );
      return;
    }

    // Update reservation status
    updateReserva(reserva.id, { estado: 'Cancelado' });

    // Credit points to the partner (RS-3.5)
    // Convert 10% of reservation value into points (10 ARS = 1 Point)
    const pointsToCredit = Math.round(reserva.monto * 0.1);
    const socio = socios.find((s) => s.dni === reserva.usuarioDni);
    if (socio) {
      updateSocio(socio.dni, { puntos: socio.puntos + pointsToCredit });
      // Show success notification or alert (handled via local message in real app, here we just update state)
    }
  };

  // Open Reprogramming Modal (RS-5.2)
  const handleOpenReprogram = (reserva: Reserva) => {
    setReprogrammingReserva(reserva);
    setReprogramForm({
      fecha: reserva.fecha,
      horario: reserva.horario
    });
    setReprogramError(null);
  };

  // Reprogram Submit (RS-5.2)
  const handleReprogramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReprogramError(null);

    if (!reprogrammingReserva) return;
    const { fecha, horario } = reprogramForm;

    // 1. Check 48 hours limit for new date
    if (!isAtLeast48HoursAway(fecha, horario)) {
      setReprogramError('La nueva fecha debe ser con un mínimo de 48 horas de anticipación.');
      return;
    }

    // 2. Check 48 hours limit for original date (since we are modifying it)
    if (!isAtLeast48HoursAway(reprogrammingReserva.fecha, reprogrammingReserva.horario)) {
      setReprogramError('No se puede reprogramar. La reserva original está a menos de 48 horas.');
      return;
    }

    // 3. Check availability
    const isAlreadyBooked = reservas.some(
      (r) =>
        r.id !== reprogrammingReserva.id &&
        r.servicioId === reprogrammingReserva.servicioId &&
        r.fecha === fecha &&
        r.horario === horario &&
        r.estado !== 'Cancelado'
    );

    if (isAlreadyBooked) {
      setReprogramError('El horario seleccionado ya está ocupado.');
      return;
    }

    updateReserva(reprogrammingReserva.id, {
      fecha,
      horario,
      estado: 'Pendiente' // Set back to pending payment if rescheduled (or keep same)
    });

    setReprogrammingReserva(null);
  };

  // Filtered Reservations
  const filteredReservas = reservas.filter((reserva) => {
    const matchesSearch =
      reserva.usuarioNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reserva.usuarioDni.includes(searchQuery);

    const matchesService = serviceFilter === 'all' || reserva.servicioId === serviceFilter;
    const matchesStatus = statusFilter === 'all' || reserva.estado === statusFilter;

    return matchesSearch && matchesService && matchesStatus;
  });

  return (
    <div className="space-y-6 select-none text-xs">
      {/* Filters & Actions */}
      <Card className="shadow-xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-500">Servicio:</span>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="h-8 px-2 border border-gray-200 bg-white rounded-lg focus:outline-none text-xs font-semibold cursor-pointer"
              >
                <option value="all">Todos</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-500">Estado:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 px-2 border border-gray-200 bg-white rounded-lg focus:outline-none text-xs font-semibold cursor-pointer"
              >
                <option value="all">Todos</option>
                <option value="Pagado">Pagado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <Button
            onClick={() => setIsNewReservaOpen(true)}
            variant="brand"
            size="sm"
            className="flex items-center gap-1.5 font-semibold text-xs rounded-lg shadow-xs h-8 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nueva Reserva
          </Button>
        </CardContent>
      </Card>

      {/* Cancellation Error Alert */}
      {cancellationError && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-bold mb-0.5">Cancelación Denegada (Regla 48 Horas)</h4>
            <p className="font-medium text-red-700/90">{cancellationError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancellationError(null)}
              className="mt-2 text-[10px] h-7 px-2.5 font-semibold bg-white border-red-200 text-red-700 hover:bg-red-50"
            >
              Entendido
            </Button>
          </div>
        </div>
      )}

      {/* Reservations Table */}
      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/50">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">SOCIO / DNI</th>
                  <th className="py-3 px-6">SERVICIO</th>
                  <th className="py-3 px-6">FECHA Y HORA</th>
                  <th className="py-3 px-6">VALOR</th>
                  <th className="py-3 px-6">ESTADO</th>
                  <th className="py-3 px-6 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredReservas.map((reserva) => (
                  <tr key={reserva.id} className="hover:bg-gray-50/30 transition-colors">
                    {/* ID */}
                    <td className="py-4 px-6 font-semibold text-gray-400">{reserva.id}</td>

                    {/* Socio */}
                    <td className="py-4 px-6 space-y-0.5">
                      <div className="font-bold text-gray-950">{reserva.usuarioNombre}</div>
                      <div className="text-[10px] text-gray-400 font-normal">DNI: {reserva.usuarioDni}</div>
                    </td>

                    {/* Servicio */}
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900">{reserva.servicioNombre}</span>
                    </td>

                    {/* Fecha y Hora */}
                    <td className="py-4 px-6 space-y-0.5">
                      <div className="font-semibold text-gray-850 flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                        {reserva.fecha.split('-').reverse().join('/')}
                      </div>
                      <div className="text-[10px] text-gray-400 font-normal flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {reserva.horario} hs
                      </div>
                    </td>

                    {/* Valor */}
                    <td className="py-4 px-6 font-bold text-gray-900">${reserva.monto.toLocaleString('es-AR')}</td>

                    {/* Estado */}
                    <td className="py-4 px-6">
                      <Badge
                        variant={
                          reserva.estado === 'Pagado'
                            ? 'success'
                            : reserva.estado === 'Pendiente'
                            ? 'warning'
                            : 'destructive'
                        }
                        className="text-[10px] font-bold px-2 py-0.5 shadow-2xs"
                      >
                        {reserva.estado}
                      </Badge>
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-6 text-right">
                      {reserva.estado !== 'Cancelado' && (
                        <div className="flex items-center justify-end gap-2">
                          {/* Reprogram */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenReprogram(reserva)}
                            className="h-8 px-2.5 text-[10px] font-bold flex items-center gap-1 text-gray-600"
                            title="Reprogramar reserva"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Reprogramar
                          </Button>

                          {/* Cancel */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelReserva(reserva)}
                            className="h-8 px-2.5 text-[10px] font-bold flex items-center gap-1 text-red-600 hover:bg-red-50"
                            title="Cancelar reserva"
                          >
                            <XCircle className="h-3 w-3" />
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredReservas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400 font-medium bg-gray-50/10">
                      No se encontraron reservas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Reservation Modal */}
      <Dialog open={isNewReservaOpen} onOpenChange={setIsNewReservaOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Reserva</DialogTitle>
            <DialogDescription>
              Seleccione el socio, el servicio, la fecha y hora de la reserva.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateReserva} className="space-y-4 mt-2">
            {formError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium">
                {formError}
              </div>
            )}

            {/* Socio */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Socio Solicitante</label>
              <select
                value={newReservaForm.usuarioDni}
                onChange={(e) => setNewReservaForm({ ...newReservaForm, usuarioDni: e.target.value })}
                className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs cursor-pointer"
                required
              >
                <option value="">Seleccione un socio...</option>
                {socios.filter(s => s.estado === 'Activo').map((s) => (
                  <option key={s.dni} value={s.dni}>
                    {s.nombre} (DNI: {s.dni})
                  </option>
                ))}
              </select>
            </div>

            {/* Servicio */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Servicio a Reservar</label>
              <select
                value={newReservaForm.servicioId}
                onChange={(e) => setNewReservaForm({ ...newReservaForm, servicioId: e.target.value })}
                className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs cursor-pointer"
                required
              >
                <option value="">Seleccione un servicio...</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id} disabled={s.estado === 'Mantenimiento'}>
                    {s.nombre} - ${s.precioBase.toLocaleString('es-AR')} {s.estado === 'Mantenimiento' ? '(En Mantenimiento)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Fecha */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Fecha de Reserva</label>
                <input
                  type="date"
                  value={newReservaForm.fecha}
                  onChange={(e) => setNewReservaForm({ ...newReservaForm, fecha: e.target.value })}
                  className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  required
                />
              </div>

              {/* Horario */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Horario</label>
                <select
                  value={newReservaForm.horario}
                  onChange={(e) => setNewReservaForm({ ...newReservaForm, horario: e.target.value })}
                  className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs cursor-pointer"
                  required
                >
                  {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map((h) => (
                    <option key={h} value={h}>
                      {h} hs
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estado */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Estado Inicial</label>
              <select
                value={newReservaForm.estado}
                onChange={(e) => setNewReservaForm({ ...newReservaForm, estado: e.target.value as Reserva['estado'] })}
                className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              >
                <option value="Pendiente">Pendiente de Pago</option>
                <option value="Pagado">Pagado (Mercado Pago)</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsNewReservaOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="brand"
                size="sm"
                className="text-xs font-semibold"
              >
                Confirmar Reserva
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reprogramming Modal */}
      {reprogrammingReserva && (
        <Dialog open={!!reprogrammingReserva} onOpenChange={(open) => !open && setReprogrammingReserva(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reprogramar Reserva</DialogTitle>
              <DialogDescription>
                Cambie la fecha y horario para la reserva de {reprogrammingReserva.usuarioNombre} ({reprogrammingReserva.servicioNombre}).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleReprogramSubmit} className="space-y-4 mt-2">
              {reprogramError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium">
                  {reprogramError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Fecha */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-700">Nueva Fecha</label>
                  <input
                    type="date"
                    value={reprogramForm.fecha}
                    onChange={(e) => setReprogramForm({ ...reprogramForm, fecha: e.target.value })}
                    className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                    required
                  />
                </div>

                {/* Horario */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-700">Nuevo Horario</label>
                  <select
                    value={reprogramForm.horario}
                    onChange={(e) => setReprogramForm({ ...reprogramForm, horario: e.target.value })}
                    className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs cursor-pointer"
                    required
                  >
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map((h) => (
                      <option key={h} value={h}>
                        {h} hs
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReprogrammingReserva(null)}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  className="text-xs font-semibold"
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
export default ReservasPage;
