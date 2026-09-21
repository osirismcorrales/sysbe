import React from 'react';
import { CalendarDays } from 'lucide-react';
import { EnProgreso } from '../../../components/ui/EnProgreso';

export function ReservasPage() {
  return (
    <EnProgreso
      modulo="Gestión de Reservas"
      descripcion="El sistema de reserva de canchas y turnos para el polideportivo se encuentra en fase de desarrollo y estará conectado a los servicios correspondientes próximamente."
      icono={CalendarDays}
    />
  );
}

export default ReservasPage;
