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

// ── DTOs del Backend (Spring Boot /api/usuarios) ─────────────────────────────

export interface UsuarioResponseDto {
  id: number | string;
  nombre?: string;
  apellido?: string;
  name?: string;
  dni: string;
  email: string;
  telefono?: string;
  phone?: string;
  categoria?: UserCategory | string;
  category?: UserCategory;
  clasificacion?: UserClassification | string;
  classification?: UserClassification;
  estado?: UserStatus | string;
  status?: UserStatus;
  fechaAlta?: string;
  memberSince?: string;
  [key: string]: any;
}

export interface UsuarioUpdateMeDto {
  nombre?: string;
  apellido?: string;
  name?: string;
  email?: string;
  telefono?: string;
  phone?: string;
  [key: string]: any;
}

// ── DTOs de Autenticación (Spring Boot /api/auth) ───────────────────────────

export interface LoginRequestDto {
  dni: string;
  password: string;
}

export interface LoginResponseDto {
  token?: string;
  accessToken?: string;
  jwt?: string;
  usuario?: UsuarioResponseDto;
  user?: UsuarioResponseDto;
  id?: number | string;
  dni?: string;
  [key: string]: any;
}

/**
 * Normaliza un UsuarioResponseDto proveniente de Spring Boot al modelo User de la app
 */
export function mapUsuarioDtoToUser(dto: UsuarioResponseDto): User {
  const resolvedName =
    dto.name ||
    dto.nombreCompleto ||
    [dto.nombre, dto.apellido].filter(Boolean).join(" ") ||
    "Usuario SBE";

  const resolvedCategory: UserCategory =
    (dto.category as UserCategory) ||
    (dto.categoria as UserCategory) ||
    (dto.tipoUsuario as UserCategory) ||
    "Interno";

  const resolvedClassification: UserClassification =
    (dto.classification as UserClassification) ||
    (dto.clasificacion as UserClassification) ||
    (dto.claustro as UserClassification) ||
    "Alumno";

  const resolvedStatus: UserStatus =
    (dto.status as UserStatus) ||
    (dto.estado as UserStatus) ||
    "Activo";

  const resolvedId = dto.id ?? dto.usuarioId ?? dto.idUsuario ?? "";

  return {
    id: String(resolvedId),
    name: resolvedName,
    dni: String(dto.dni || dto.documento || dto.numeroDocumento || ""),
    email: dto.email || dto.correo || dto.mail || "",
    phone: dto.telefono || dto.phone || dto.celular || "",
    category: resolvedCategory,
    classification: resolvedClassification,
    status: resolvedStatus,
    memberSince: dto.fechaAlta || dto.memberSince || dto.createdAt || "",
  };
}

// ── Membresía ──

export type Membership = {
  type: UserCategory;
  monthlyFee: number;       // en pesos
  discountPercent: number;   // descuento sobre reservas
  dueDate: string;           // fecha de vencimiento de la cuota
  isPaid: boolean;
};

// ── Fallbacks iniciales vacíos (sin mock data) ──────────────────────────────

export const EMPTY_USER: User = {
  id: "",
  name: "",
  dni: "",
  email: "",
  phone: "",
  category: "No Socio",
  classification: "Alumno",
  status: "Activo",
  memberSince: "",
};

export const EMPTY_MEMBERSHIP: Membership = {
  type: "No Socio",
  monthlyFee: 0,
  discountPercent: 0,
  dueDate: "",
  isPaid: true,
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
