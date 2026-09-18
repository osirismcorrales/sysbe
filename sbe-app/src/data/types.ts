// ── Tipos globales del sistema SBE UNSE ──────────────────────────────────────

export type UserCategory = "Interno" | "Externo" | "No Socio";
export type UserClassification = "Alumno" | "Docente" | "No Docente" | "Externo";
export type UserStatus = "Activo" | "De baja";

export type User = {
  id: string;
  name: string;
  dni: string;
  email: string;
  phone: string;
  category: UserCategory;
  classification: UserClassification;
  status: UserStatus;
  memberSince: string; // ISO date
};

// ── Membresía ──

export type Membership = {
  type: UserCategory;
  monthlyFee: number;       // en pesos
  discountPercent: number;   // descuento sobre reservas
  dueDate: string;           // fecha de vencimiento de la cuota
  isPaid: boolean;
};

// ── Puntos ──

export type PointMovement = {
  id: string;
  date: string;        // ISO date
  description: string;
  amount: number;       // positivo = ganado, negativo = canjeado/devuelto
};

// ── Reservas ──

export type ReservationStatus = "reservado" | "completado" | "cancelado" | "pendiente";

export type Reservation = {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;         // ISO date
  time: string;         // "HH:mm"
  price: number;
  discount: number;     // monto descontado
  pointsUsed: number;
  pointsEarned: number;
  status: ReservationStatus;
  createdAt: string;    // ISO date
};

// ── Pagos ──

export type PaymentConcept = "reserva" | "cuota" | "otro";
export type PaymentStatus = "aprobado" | "pendiente" | "rechazado";

export type Payment = {
  id: string;
  concept: PaymentConcept;
  description: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  reservationId?: string; // si está asociado a una reserva
};

// ── Servicios ──

export type ServiceCategory = "deportes" | "pileta" | "asadores";

export type TimeSlot = {
  time: string;       // "HH:mm"
  available: boolean;
};

export type Service = {
  id: string;
  name: string;
  category: ServiceCategory;
  maxPeople: number;
  price: number;
  available: boolean;
  slots: TimeSlot[];
};

// ── Promociones ──

export type Promotion = {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  active: boolean;
};
