export type UserCategory = "Interno" | "Externo" | "No Socio";
export type UserClassification = "Alumno" | "Docente" | "No Docente" | "Externo";
export type UserStatus = "Activo" | "De baja";

export type User = {
  id: string;
  name: string;
  dni: string;
  email: string;
  phone: string;
  category: string;
  categoriaObj?: CategoriaResponseDto;
  classification: string;
  status: UserStatus;
  memberSince: string; // ISO date
  domicilio: string;
  rol: string;
  puntosAcumulados: number;
  fechaNacimiento: string;
};

// ── DTOs del Backend (Spring Boot /api/usuarios) ─────────────────────────────

/**
 * Espejo exacto del record CategoriaResponseDto de Spring Boot.
 * public record CategoriaResponseDto(
 *         Integer idCategoria,
 *         String tipoSocio,
 *         String vinculoUnse,      // puede ser null
 *         String etiqueta,         // texto listo para mostrar en el selector
 *         BigDecimal descuento,
 *         BigDecimal cuotaMensual,
 *         BigDecimal cuotaTrimestral,
 *         BigDecimal cuotaAnual
 * ) {}
 */
export interface CategoriaResponseDto {
  idCategoria?: number;
  tipoSocio?: string;
  vinculoUnse?: string | null;
  etiqueta?: string;
  /** Porcentaje de descuento (aplica a socios). Mutuamente excluyente con recargo. */
  descuento?: number | null;
  /** Porcentaje de recargo (aplica a no socios). Mutuamente excluyente con descuento. */
  recargo?: number | null;
  cuotaMensual?: number;
  cuotaTrimestral?: number;
  cuotaAnual?: number;
}

/**
 * Espejo exacto del record UsuarioResponseDto de Spring Boot.
 * Campos: id, dni, nombreCompleto, email, fechaNacimiento, puntosAc,
 *         estado, domicilio, rol, categoria
 */
export interface UsuarioResponseDto {
  id: number;
  dni: string;
  nombreCompleto: string;
  email: string;
  fechaNacimiento?: string;
  puntosAc?: number;
  estado?: string;
  domicilio?: string;
  rol?: any;
  categoria?: CategoriaResponseDto | string | null;
}

export interface UsuarioUpdateMeDto {
  nombreCompleto: string;
  email: string;
  fechaNacimiento: string; // ISO date string (LocalDateTime en backend)
  domicilio: string;
  password?: string; // Opcional: solo si el usuario desea cambiar su clave
}

// ── DTOs de Autenticación (Spring Boot /api/auth) ───────────────────────────

export interface LoginRequestDto {
  dni: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
}

/**
 * Formatea el vínculo UNSE ("ALUMNO", "DOCENTE", "NODOCENTE", "SIN_VINCULO_UNSE")
 * a un texto legible y profesional para el usuario.
 */
export function formatVinculoLabel(vinculo?: string | null): string {
  if (!vinculo) return "Sin vínculo UNSE";
  const raw = vinculo.trim().toUpperCase();
  if (
    raw === "SIN_VINCULO_UNSE" ||
    raw === "SIN_VINCULO" ||
    raw === "NINGUNO" ||
    raw === "SIN VINCULO"
  ) {
    return "Sin vínculo UNSE";
  }
  if (raw === "ALUMNO") return "Alumno";
  if (raw === "DOCENTE") return "Docente";
  if (raw === "NODOCENTE" || raw === "NO_DOCENTE" || raw === "NO DOCENTE") {
    return "No Docente";
  }
  return vinculo.charAt(0).toUpperCase() + vinculo.slice(1).toLowerCase();
}

/**
 * Formatea el tipo de socio ("SOCIO_INTERNO", "SOCIO_EXTERNO", "NO_SOCIO")
 */
export function formatTipoSocioLabel(tipoSocio?: string | null): string {
  if (!tipoSocio) return "No Socio";
  const raw = tipoSocio.trim().toUpperCase();
  if (raw === "SOCIO_INTERNO" || raw === "INTERNO") return "Socio Interno";
  if (raw === "SOCIO_EXTERNO" || raw === "EXTERNO") return "Socio Externo";
  if (raw === "NO_SOCIO" || raw === "NO SOCIO" || raw === "") return "No Socio";
  return tipoSocio;
}

/**
 * Formatea la categoría del usuario para mostrarla de manera amigable y clara.
 * Evita textos crudos como "SIN_VINCULO_UNSE" o redundancias como "Socio No Socio".
 */
export function formatCategoriaLabel(
  categoria?: CategoriaResponseDto | string | null
): string {
  if (!categoria) return "No Socio";

  // Si vino directamente como string
  if (typeof categoria === "string") {
    return formatTipoSocioLabel(categoria);
  }

  // Si viene con etiqueta del backend limpia (que no contenga cadenas crudas de backend)
  if (
    categoria.etiqueta &&
    categoria.etiqueta.trim().length > 0 &&
    !categoria.etiqueta.toUpperCase().includes("SIN_VINCULO") &&
    !categoria.etiqueta.toUpperCase().includes("NO_SOCIO") &&
    !categoria.etiqueta.toUpperCase().includes("SOCIO_INTERNO") &&
    !categoria.etiqueta.toUpperCase().includes("SOCIO_EXTERNO")
  ) {
    return categoria.etiqueta;
  }

  const tipo = formatTipoSocioLabel(categoria.tipoSocio);
  const vinculoRaw = (categoria.vinculoUnse || "").trim().toUpperCase();

  // Si es sin vínculo UNSE o no socio, solo mostramos el tipo
  if (
    !vinculoRaw ||
    vinculoRaw === "SIN_VINCULO_UNSE" ||
    vinculoRaw === "SIN_VINCULO" ||
    vinculoRaw === "NINGUNO"
  ) {
    return tipo;
  }

  const vinculoFormatted = formatVinculoLabel(categoria.vinculoUnse);
  return `${tipo} · ${vinculoFormatted}`;
}

/**
 * Normaliza un UsuarioResponseDto proveniente de Spring Boot al modelo User de la app
 */
export function mapUsuarioDtoToUser(dto: UsuarioResponseDto): User {
  const estadoMap: Record<string, UserStatus> = {
    ACTIVO: "Activo",
    Activo: "Activo",
    DE_BAJA: "De baja",
    "De baja": "De baja",
  };

  const categoriaObj =
    typeof dto.categoria === "object" && dto.categoria !== null
      ? (dto.categoria as CategoriaResponseDto)
      : undefined;

  const categoryLabel = formatCategoriaLabel(dto.categoria);

  let rolNombre = "";
  if (typeof dto.rol === "object" && dto.rol !== null) {
    rolNombre = dto.rol.nombreRol || dto.rol.nombre || "";
  } else if (dto.rol) {
    rolNombre = String(dto.rol);
  }

  const rawVinculo = categoriaObj?.vinculoUnse;
  const isSinVinculo =
    !rawVinculo ||
    rawVinculo.trim().toUpperCase() === "SIN_VINCULO_UNSE" ||
    rawVinculo.trim().toUpperCase() === "SIN_VINCULO" ||
    rawVinculo.trim().toUpperCase() === "NINGUNO";

  const classification = isSinVinculo
    ? "Sin vínculo UNSE"
    : formatVinculoLabel(rawVinculo);

  return {
    id: String(dto.id),
    name: dto.nombreCompleto || "Usuario SBE",
    dni: dto.dni || "",
    email: dto.email || "",
    phone: "",
    category: categoryLabel,
    categoriaObj,
    classification,
    status: estadoMap[dto.estado || ""] || "Activo",
    memberSince: "",
    domicilio: dto.domicilio || "",
    rol: rolNombre,
    puntosAcumulados: dto.puntosAc ?? 0,
    fechaNacimiento: dto.fechaNacimiento || "",
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
  domicilio: "",
  rol: "",
  puntosAcumulados: 0,
  fechaNacimiento: "",
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

export type EstadoReserva =
  | "RESERVADA"
  | "CANCELADA"
  | "REPROGRAMADA"
  | "FINALIZADA"
  | "BLOQUEADA";

export interface ReservaRequestDto {
  fechaReserva: string;  // "YYYY-MM-DD"
  horarioInicio: string; // "HH:mm:ss" o "HH:mm"
  horarioFin: string;    // "HH:mm:ss" o "HH:mm"
  idUsuario: number;
  idInstalacion: number;
}

export interface ReprogramarReservaRequestDto {
  fechaReserva: string;  // "YYYY-MM-DD"
  horarioInicio: string; // "HH:mm:ss" o "HH:mm"
  horarioFin: string;    // "HH:mm:ss" o "HH:mm"
}

export interface ReservaResponseDto {
  idReserva: number;
  fechaReserva: string;
  horarioInicio: string;
  horarioFin: string;
  estadoReserva: EstadoReserva;
  montoReserva?: number;
  idUsuario?: number;
  idInstalacion: number;
  nombreInstalacion?: string;
}

/**
 * Espejo exacto del record ReservaHistorialResponseDto de Spring Boot.
 * public record ReservaHistorialResponseDto(
 *         Long idReserva,
 *         LocalDate fechaReserva,
 *         LocalTime horarioInicio,
 *         LocalTime horarioFin,
 *         EstadoReserva estadoReserva,
 *         BigDecimal montoReserva,
 *         Long idInstalacion,
 *         String nombreInstalacion
 * ) {}
 */
export interface ReservaHistorialResponseDto {
  idReserva: number;
  fechaReserva: string;
  horarioInicio: string;
  horarioFin: string;
  estadoReserva: EstadoReserva;
  montoReserva: number;
  idInstalacion: number;
  nombreInstalacion: string;
}

export function mapReservaHistorialToReservation(
  dto: ReservaHistorialResponseDto
): Reservation {
  const hIni = dto.horarioInicio ? dto.horarioInicio.slice(0, 5) : "";
  const hFin = dto.horarioFin ? dto.horarioFin.slice(0, 5) : "";
  const timeFormatted = hIni && hFin ? `${hIni} - ${hFin}` : hIni || "";

  let status: ReservationStatus = "reservado";
  if (dto.estadoReserva === "CANCELADA") {
    status = "cancelado";
  } else if (dto.estadoReserva === "FINALIZADA") {
    status = "completado";
  }

  return {
    id: String(dto.idReserva),
    serviceId: String(dto.idInstalacion),
    serviceName: dto.nombreInstalacion || "Instalación SBE",
    date: dto.fechaReserva,
    time: timeFormatted,
    price: dto.montoReserva ?? 0,
    discount: 0,
    pointsUsed: 0,
    pointsEarned: Math.round((dto.montoReserva ?? 0) / 50) * 10,
    status,
    createdAt: dto.fechaReserva,
  };
}

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
export type PaymentStatus = "aprobado" | "pendiente" | "rechazado" | "anulado";

export type Payment = {
  id: string;
  concept: PaymentConcept;
  description: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  reservationId?: string;
};

// ── DTOs de Pagos (Spring Boot /api/pagos) ──────────────────────────────────

export type EstadoPago = "PENDIENTE" | "APROBADO" | "RECHAZADO" | "ANULADO";
export type MetodoPago = "EFECTIVO" | "TRANSFERENCIA" | "TARJETA" | "DEBITO" | "MERCADO_PAGO";
export type TipoPago = "RESERVA" | "CUOTA_MEMBRESIA";

/**
 * Espejo exacto del record PagoRequestDto de Spring Boot.
 */
export interface PagoRequestDto {
  idUsuario: number;
  idReserva?: number | null;
  tipoPago: TipoPago;
  periodo?: string | null;
  montoPago: number;
  metodoPago: MetodoPago;
  estadoPago?: EstadoPago | null;
}

/**
 * Espejo exacto del record PagoResponseDto de Spring Boot.
 */
export interface PagoResponseDto {
  idPago: number;
  idUsuario: number;
  dniUsuario?: string;
  nombreUsuario?: string;
  idReserva?: number | null;
  tipoPago: TipoPago;
  periodo?: string | null;
  montoPago: number;
  metodoPago: MetodoPago;
  estadoPago: EstadoPago;
  fechaCreacion: string; // LocalDateTime → ISO string
  fechaPago?: string | null;
  registradoPorId?: number | null;
  registradoPorNombre?: string | null;
}

/** Convierte un PagoResponseDto al modelo interno Payment de la app */
export function mapPagoToPayment(dto: PagoResponseDto): Payment {
  const estadoMap: Record<EstadoPago, PaymentStatus> = {
    APROBADO: "aprobado",
    PENDIENTE: "pendiente",
    RECHAZADO: "rechazado",
    ANULADO: "anulado",
  };

  const conceptMap: Record<TipoPago, PaymentConcept> = {
    RESERVA: "reserva",
    CUOTA_MEMBRESIA: "cuota",
  };

  const metodoPagoLabel: Record<MetodoPago, string> = {
    EFECTIVO: "Efectivo",
    TRANSFERENCIA: "Transferencia",
    TARJETA: "Tarjeta",
    DEBITO: "Débito",
    MERCADO_PAGO: "Mercado Pago",
  };

  const concept = conceptMap[dto.tipoPago] ?? "otro";

  let description = "";
  if (dto.tipoPago === "RESERVA") {
    description = dto.idReserva
      ? `Reserva #${dto.idReserva}`
      : "Pago de reserva";
  } else if (dto.tipoPago === "CUOTA_MEMBRESIA") {
    description = dto.periodo
      ? `Cuota de membresía · ${dto.periodo}`
      : "Cuota de membresía";
  } else {
    description = "Pago";
  }

  const rawDate = dto.fechaPago ?? dto.fechaCreacion;
  const dateFormatted = rawDate
    ? new Date(rawDate).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const metodoLabel = metodoPagoLabel[dto.metodoPago] ?? dto.metodoPago;
  const dateDisplay = dateFormatted
    ? `${dateFormatted} · ${metodoLabel}`
    : metodoLabel;

  return {
    id: String(dto.idPago),
    concept,
    description,
    amount: dto.montoPago,
    date: dateDisplay,
    status: estadoMap[dto.estadoPago] ?? "pendiente",
    reservationId: dto.idReserva != null ? String(dto.idReserva) : undefined,
  };
}

// ── Instalaciones / Servicios (Spring Boot: /api/instalaciones) ──

/**
 * Espejo exacto del record InstalacionResponseDto de Spring Boot.
 */
export interface InstalacionResponseDto {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  precio_base: number;
  duracion_minutos: number;
}

/**
 * Modelo interno de la app para una instalación/servicio.
 */
export type Service = {
  id: string;
  name: string;
  description: string;
  status: string;
  price: number;
  durationMinutes: number;
};

/**
 * Convierte un InstalacionResponseDto del backend al modelo Service de la app.
 */
export function mapInstalacionToService(dto: InstalacionResponseDto): Service {
  return {
    id: String(dto.id),
    name: dto.nombre || "",
    description: dto.descripcion || "",
    status: dto.estado || "",
    price: dto.precio_base ?? 0,
    durationMinutes: dto.duracion_minutos ?? 0,
  };
}

// ── Disponibilidad y Plantillas Horarias (Spring Boot: /api/plantillas-horario) ──

export type DiaSemana =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO"
  | "DOMINGO";

/**
 * Espejo exacto de BloqueDto de Spring Boot.
 * public record BloqueDto(LocalTime horaInicio, LocalTime horaFin, boolean disponible) {}
 */
export interface BloqueDto {
  horaInicio: string; // "HH:mm" o "HH:mm:ss"
  horaFin: string;    // "HH:mm" o "HH:mm:ss"
  disponible: boolean;
}

/**
 * Espejo de PlantillaHorarioResponseDto de Spring Boot.
 */
export interface PlantillaHorarioResponseDto {
  id: number;
  idInstalacion: number;
  nombreInstalacion?: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
}

/**
 * Espejo de PlantillaHorarioRequestDto de Spring Boot.
 */
export interface PlantillaHorarioRequestDto {
  idInstalacion: number;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
}

// ── Promociones ──

export type Promotion = {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  active: boolean;
};
