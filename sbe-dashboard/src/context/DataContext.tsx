import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- TYPES ---

export interface Socio {
  dni: string;
  nombre: string;
  email: string;
  fechaNacimiento: string;
  domicilio: string;
  categoria: 'Interno' | 'Externo' | 'No socio';
  vinculo?: 'Alumno' | 'Docente' | 'Nodocente' | 'Ninguno';
  puntos: number;
  estado: 'Activo' | 'De baja';
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  capacidadMax: number;
  estado: 'Habilitada' | 'Mantenimiento' | 'Deshabilitada';
}

export interface Reserva {
  id: string;
  usuarioDni: string;
  usuarioNombre: string;
  servicioId: string;
  servicioNombre: string;
  fecha: string; // Format: YYYY-MM-DD
  horario: string; // Format: HH:MM
  tipoUsuario: 'Interno' | 'Externo' | 'No socio';
  estado: 'Pagado' | 'Pendiente' | 'Cancelado';
  monto: number;
}

export interface Pago {
  id: string;
  reservaId?: string;
  usuarioDni: string;
  usuarioNombre: string;
  fecha: string; // YYYY-MM-DD
  monto: number;
  metodo: 'Mercado Pago';
  estado: 'Aprobado' | 'Pendiente' | 'Rechazado';
}

interface DataContextType {
  socios: Socio[];
  servicios: Servicio[];
  reservas: Reserva[];
  pagos: Pago[];
  addSocio: (socio: Socio) => void;
  updateSocio: (dni: string, updated: Partial<Socio>) => void;
  deleteSocio: (dni: string) => void;
  addReserva: (reserva: Omit<Reserva, 'id'>) => void;
  updateReserva: (id: string, updated: Partial<Reserva>) => void;
  updateServicioEstado: (id: string, estado: Servicio['estado']) => void;
  addPago: (pago: Pago) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- INITIAL DATA (SIN MOCK DATA) ---

const initialSocios: Socio[] = [];
const initialServicios: Servicio[] = [];
const initialReservas: Reserva[] = [];
const initialPagos: Pago[] = [];

// --- PROVIDER ---

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [socios, setSocios] = useState<Socio[]>(initialSocios);
  const [servicios, setServicios] = useState<Servicio[]>(initialServicios);
  const [reservas, setReservas] = useState<Reserva[]>(initialReservas);
  const [pagos, setPagos] = useState<Pago[]>(initialPagos);

  const addSocio = (socio: Socio) => {
    setSocios((prev) => [socio, ...prev]);
  };

  const updateSocio = (dni: string, updated: Partial<Socio>) => {
    setSocios((prev) =>
      prev.map((s) => (s.dni === dni ? { ...s, ...updated } : s))
    );
  };

  const deleteSocio = (dni: string) => {
    // We soft-delete or change state to "De baja" as per RS-1.2
    setSocios((prev) =>
      prev.map((s) => (s.dni === dni ? { ...s, estado: 'De baja' } : s))
    );
  };

  const addReserva = (reserva: Omit<Reserva, 'id'>) => {
    const newReserva: Reserva = {
      ...reserva,
      id: `res-${Date.now()}`
    };
    setReservas((prev) => [newReserva, ...prev]);

    // If reservation is immediately paid, also record a payment
    if (reserva.estado === 'Pagado') {
      addPago({
        id: `pag-${Date.now()}`,
        reservaId: newReserva.id,
        usuarioDni: reserva.usuarioDni,
        usuarioNombre: reserva.usuarioNombre,
        fecha: newReserva.fecha,
        monto: newReserva.monto,
        metodo: 'Mercado Pago',
        estado: 'Aprobado'
      });
    }
  };

  const updateReserva = (id: string, updated: Partial<Reserva>) => {
    setReservas((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
  };

  const updateServicioEstado = (id: string, estado: Servicio['estado']) => {
    setServicios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado } : s))
    );
  };

  const addPago = (pago: Pago) => {
    setPagos((prev) => [pago, ...prev]);
  };

  return (
    <DataContext.Provider
      value={{
        socios,
        servicios,
        reservas,
        pagos,
        addSocio,
        updateSocio,
        deleteSocio,
        addReserva,
        updateReserva,
        updateServicioEstado,
        addPago
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
