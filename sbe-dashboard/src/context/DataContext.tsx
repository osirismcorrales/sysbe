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

// --- INITIAL MOCK DATA ---

const initialSocios: Socio[] = [
  { dni: '38123456', nombre: 'Juan Pérez', email: 'juan.perez@gmail.com', fechaNacimiento: '1995-04-12', domicilio: 'Av. Belgrano 1234', categoria: 'Interno', vinculo: 'Alumno', puntos: 350, estado: 'Activo' },
  { dni: '40987654', nombre: 'Martina González', email: 'm.gonzalez@hotmail.com', fechaNacimiento: '1998-09-21', domicilio: 'Calle Libertad 456', categoria: 'Interno', vinculo: 'Alumno', puntos: 280, estado: 'Activo' },
  { dni: '35123987', nombre: 'Luis Ramos', email: 'lramos@gmail.com', fechaNacimiento: '1991-11-05', domicilio: 'Sáenz Peña 789', categoria: 'Externo', vinculo: 'Ninguno', puntos: 120, estado: 'Activo' },
  { dni: '39456123', nombre: 'Ana López', email: 'ana.lopez@unse.edu.ar', fechaNacimiento: '1996-07-18', domicilio: 'Rivadavia 1100', categoria: 'Interno', vinculo: 'Docente', puntos: 410, estado: 'Activo' },
  { dni: '37654321', nombre: 'Carlos Rodríguez', email: 'carlos.rod@gmail.com', fechaNacimiento: '1994-02-28', domicilio: 'Pedro León Gallo 321', categoria: 'Externo', vinculo: 'Ninguno', puntos: 90, estado: 'Activo' },
  { dni: '42111222', nombre: 'María Becerra', email: 'maria.b@unse.edu.ar', fechaNacimiento: '2000-05-15', domicilio: 'Av. Colón 500', categoria: 'Interno', vinculo: 'Alumno', puntos: 150, estado: 'Activo' },
  { dni: '33888999', nombre: 'Gisela Díaz', email: 'gdiaz@gmail.com', fechaNacimiento: '1988-08-08', domicilio: 'Av. Roca 88', categoria: 'No socio', vinculo: 'Ninguno', puntos: 0, estado: 'Activo' }
];

const initialServicios: Servicio[] = [
  { id: '1', nombre: 'Pileta', descripcion: 'Pileta olímpica climatizada para natación libre o clases.', precioBase: 1500, capacidadMax: 30, estado: 'Habilitada' },
  { id: '2', nombre: 'Fútbol 5', descripcion: 'Cancha de fútbol 5 con césped sintético e iluminación LED.', precioBase: 3200, capacidadMax: 10, estado: 'Habilitada' },
  { id: '3', nombre: 'Gimnasio', descripcion: 'Sala de musculación y cardio con equipamiento moderno.', precioBase: 1200, capacidadMax: 20, estado: 'Mantenimiento' },
  { id: '4', nombre: 'Tenis', descripcion: 'Cancha de polvo de ladrillo.', precioBase: 2500, capacidadMax: 4, estado: 'Habilitada' },
  { id: '5', nombre: 'Asadores Gde.', descripcion: 'Asador grande con mesa y sombra para grupos y familias.', precioBase: 1800, capacidadMax: 15, estado: 'Habilitada' },
  { id: '6', nombre: 'Básquet', descripcion: 'Cancha cubierta de básquetbol y vóleibol.', precioBase: 2800, capacidadMax: 12, estado: 'Habilitada' }
];

const initialReservas: Reserva[] = [
  { id: 'res-1', usuarioDni: '38123456', usuarioNombre: 'Juan Pérez', servicioId: '2', servicioNombre: 'Fútbol 5', fecha: '2026-05-31', horario: '18:00', tipoUsuario: 'Interno', estado: 'Pagado', monto: 3200 },
  { id: 'res-2', usuarioDni: '40987654', usuarioNombre: 'Martina González', servicioId: '1', servicioNombre: 'Pileta', fecha: '2026-05-31', horario: '09:00', tipoUsuario: 'Interno', estado: 'Pagado', monto: 1500 },
  { id: 'res-3', usuarioDni: '35123987', usuarioNombre: 'Luis Ramos', servicioId: '4', servicioNombre: 'Tenis', fecha: '2026-06-01', horario: '10:00', tipoUsuario: 'Externo', estado: 'Pendiente', monto: 2500 },
  { id: 'res-4', usuarioDni: '39456123', usuarioNombre: 'Ana López', servicioId: '6', servicioNombre: 'Básquet', fecha: '2026-06-01', horario: '16:00', tipoUsuario: 'Interno', estado: 'Pagado', monto: 2800 },
  { id: 'res-5', usuarioDni: '37654321', usuarioNombre: 'Carlos Rodríguez', servicioId: '5', servicioNombre: 'Asador Gde.', fecha: '2026-06-02', horario: '12:00', tipoUsuario: 'Externo', estado: 'Pagado', monto: 1800 }
];

const initialPagos: Pago[] = [
  { id: 'pag-1', reservaId: 'res-1', usuarioDni: '38123456', usuarioNombre: 'Juan Pérez', fecha: '2026-05-30', monto: 3200, metodo: 'Mercado Pago', estado: 'Aprobado' },
  { id: 'pag-2', reservaId: 'res-2', usuarioDni: '40987654', usuarioNombre: 'Martina González', fecha: '2026-05-30', monto: 1500, metodo: 'Mercado Pago', estado: 'Aprobado' },
  { id: 'pag-3', reservaId: 'res-4', usuarioDni: '39456123', usuarioNombre: 'Ana López', fecha: '2026-05-31', monto: 2800, metodo: 'Mercado Pago', estado: 'Aprobado' },
  { id: 'pag-4', reservaId: 'res-5', usuarioDni: '37654321', usuarioNombre: 'Carlos Rodríguez', fecha: '2026-06-01', monto: 1800, metodo: 'Mercado Pago', estado: 'Aprobado' },
  // General membership payments to justify the $184.200 total in the dashboard
  { id: 'pag-m1', usuarioDni: '38123456', usuarioNombre: 'Juan Pérez', fecha: '2026-05-15', monto: 15000, metodo: 'Mercado Pago', estado: 'Aprobado' },
  { id: 'pag-m2', usuarioDni: '40987654', usuarioNombre: 'Martina González', fecha: '2026-05-16', monto: 15000, metodo: 'Mercado Pago', estado: 'Aprobado' },
  { id: 'pag-m3', usuarioDni: '35123987', usuarioNombre: 'Luis Ramos', fecha: '2026-05-18', monto: 25000, metodo: 'Mercado Pago', estado: 'Aprobado' },
  { id: 'pag-m4', usuarioDni: '39456123', usuarioNombre: 'Ana López', fecha: '2026-05-20', monto: 15000, metodo: 'Mercado Pago', estado: 'Aprobado' },
  { id: 'pag-m5', usuarioDni: '42111222', usuarioNombre: 'María Becerra', fecha: '2026-05-22', monto: 15000, metodo: 'Mercado Pago', estado: 'Aprobado' }
];

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
