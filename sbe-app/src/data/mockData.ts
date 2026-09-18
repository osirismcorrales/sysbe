import type {
  User,
  Membership,
  PointMovement,
  Reservation,
  Payment,
  Service,
  Promotion,
} from "./types";

// ── Usuario de ejemplo ──────────────────────────────────────────────────────

export const MOCK_USER: User = {
  id: "usr-001",
  name: "Juan Pérez",
  dni: "12345678",
  email: "jperez@unse.edu.ar",
  phone: "385-4123456",
  category: "Interno",
  classification: "Alumno",
  status: "Activo",
  memberSince: "2024-03-15",
};

// ── Membresía ───────────────────────────────────────────────────────────────

export const MOCK_MEMBERSHIP: Membership = {
  type: "Interno",
  monthlyFee: 5500,
  discountPercent: 20,
  dueDate: "2026-07-10",
  isPaid: false,
};

// ── Puntos ───────────────────────────────────────────────────────────────────

export const MOCK_POINTS: PointMovement[] = [
  {
    id: "pt-001",
    date: "2026-06-25",
    description: "Reserva Cancha Fútbol 5",
    amount: 50,
  },
  {
    id: "pt-002",
    date: "2026-06-20",
    description: "Pago cuota junio",
    amount: 100,
  },
  {
    id: "pt-003",
    date: "2026-06-15",
    description: "Reserva Pileta olímpica",
    amount: 30,
  },
  {
    id: "pt-004",
    date: "2026-06-10",
    description: "Canje: Descuento 10%",
    amount: -80,
  },
  {
    id: "pt-005",
    date: "2026-05-28",
    description: "Pago cuota mayo",
    amount: 100,
  },
  {
    id: "pt-006",
    date: "2026-05-20",
    description: "Reserva Cancha Básquet",
    amount: 40,
  },
  {
    id: "pt-007",
    date: "2026-05-12",
    description: "Reserva Beach Vóley",
    amount: 30,
  },
  {
    id: "pt-008",
    date: "2026-04-30",
    description: "Pago cuota abril",
    amount: 100,
  },
];

// ── Reservas ────────────────────────────────────────────────────────────────

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: "res-001",
    serviceId: "futbol5",
    serviceName: "Cancha Fútbol 5",
    date: "2026-07-05",
    time: "18:00",
    price: 3200,
    discount: 640,
    pointsUsed: 0,
    pointsEarned: 50,
    status: "reservado",
    createdAt: "2026-06-28",
  },
  {
    id: "res-002",
    serviceId: "pileta",
    serviceName: "Pileta olímpica",
    date: "2026-06-27",
    time: "08:00",
    price: 2500,
    discount: 500,
    pointsUsed: 0,
    pointsEarned: 30,
    status: "completado",
    createdAt: "2026-06-25",
  },
  {
    id: "res-003",
    serviceId: "basquet",
    serviceName: "Cancha Básquet",
    date: "2026-06-20",
    time: "10:00",
    price: 2800,
    discount: 560,
    pointsUsed: 80,
    pointsEarned: 40,
    status: "completado",
    createdAt: "2026-06-18",
  },
  {
    id: "res-004",
    serviceId: "futbol5",
    serviceName: "Cancha Fútbol 5",
    date: "2026-06-15",
    time: "16:00",
    price: 3200,
    discount: 640,
    pointsUsed: 0,
    pointsEarned: 50,
    status: "cancelado",
    createdAt: "2026-06-10",
  },
  {
    id: "res-005",
    serviceId: "asador1",
    serviceName: "Asador Nº 1",
    date: "2026-07-12",
    time: "12:00",
    price: 4500,
    discount: 900,
    pointsUsed: 0,
    pointsEarned: 60,
    status: "reservado",
    createdAt: "2026-06-27",
  },
];

// ── Pagos ────────────────────────────────────────────────────────────────────

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: "pay-001",
    concept: "reserva",
    description: "Cancha Fútbol 5 — 05/07",
    amount: 2560,
    date: "2026-06-28",
    status: "aprobado",
    reservationId: "res-001",
  },
  {
    id: "pay-002",
    concept: "cuota",
    description: "Cuota mensual — Junio 2026",
    amount: 5500,
    date: "2026-06-05",
    status: "aprobado",
  },
  {
    id: "pay-003",
    concept: "reserva",
    description: "Pileta olímpica — 27/06",
    amount: 2000,
    date: "2026-06-25",
    status: "aprobado",
    reservationId: "res-002",
  },
  {
    id: "pay-004",
    concept: "reserva",
    description: "Cancha Básquet — 20/06",
    amount: 2160,
    date: "2026-06-18",
    status: "aprobado",
    reservationId: "res-003",
  },
  {
    id: "pay-005",
    concept: "cuota",
    description: "Cuota mensual — Mayo 2026",
    amount: 5500,
    date: "2026-05-05",
    status: "aprobado",
  },
];

// ── Servicios ───────────────────────────────────────────────────────────────

export const MOCK_SERVICES: Service[] = [
  {
    id: "futbol5",
    name: "Cancha Fútbol 5",
    category: "deportes",
    maxPeople: 10,
    price: 3200,
    available: true,
    slots: [
      { time: "08:00", available: true },
      { time: "09:00", available: false },
      { time: "10:00", available: true },
      { time: "11:00", available: true },
      { time: "12:00", available: true },
      { time: "16:00", available: true },
      { time: "17:00", available: true },
      { time: "18:00", available: true },
    ],
  },
  {
    id: "basquet",
    name: "Cancha Básquet",
    category: "deportes",
    maxPeople: 12,
    price: 2800,
    available: true,
    slots: [
      { time: "08:00", available: false },
      { time: "10:00", available: true },
      { time: "14:00", available: true },
      { time: "16:00", available: true },
      { time: "18:00", available: true },
    ],
  },
  {
    id: "beachvoley",
    name: "Beach Vóley",
    category: "deportes",
    maxPeople: 8,
    price: 2200,
    available: true,
    slots: [
      { time: "09:00", available: true },
      { time: "11:00", available: true },
      { time: "17:00", available: true },
    ],
  },
  {
    id: "pileta",
    name: "Pileta olímpica",
    category: "pileta",
    maxPeople: 30,
    price: 2500,
    available: true,
    slots: [
      { time: "06:00", available: true },
      { time: "08:00", available: true },
      { time: "10:00", available: false },
      { time: "14:00", available: true },
      { time: "16:00", available: true },
    ],
  },
  {
    id: "pileta-rec",
    name: "Pileta recreativa",
    category: "pileta",
    maxPeople: 20,
    price: 1800,
    available: true,
    slots: [
      { time: "10:00", available: true },
      { time: "14:00", available: true },
      { time: "16:00", available: true },
    ],
  },
  {
    id: "asador1",
    name: "Asador Nº 1",
    category: "asadores",
    maxPeople: 15,
    price: 4500,
    available: true,
    slots: [
      { time: "12:00", available: true },
      { time: "20:00", available: true },
    ],
  },
  {
    id: "asador2",
    name: "Asador Nº 2",
    category: "asadores",
    maxPeople: 20,
    price: 5000,
    available: false,
    slots: [],
  },
];

// ── Promociones ─────────────────────────────────────────────────────────────

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: "promo-001",
    title: "10% off en tu próxima reserva",
    description: "Aplicable a cualquier cancha deportiva",
    pointsCost: 200,
    active: true,
  },
  {
    id: "promo-002",
    title: "Clase de natación gratis",
    description: "Una clase individual en la pileta olímpica",
    pointsCost: 350,
    active: true,
  },
  {
    id: "promo-003",
    title: "50% off en alquiler de asador",
    description: "Válido para cualquier asador disponible",
    pointsCost: 500,
    active: true,
  },
];
