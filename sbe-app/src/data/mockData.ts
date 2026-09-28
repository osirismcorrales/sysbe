import type {
  User,
  Membership,
  PointMovement,
  Reservation,
  Payment,
  Service,
  Promotion,
} from "./types";
import { EMPTY_USER, EMPTY_MEMBERSHIP } from "./types";

// Los datos mockeados han sido reemplazados por fallbacks vacíos.
// La aplicación obtiene los datos reales directamente del backend Spring Boot.

export const MOCK_USER: User = EMPTY_USER;
export const MOCK_MEMBERSHIP: Membership = EMPTY_MEMBERSHIP;
export const MOCK_POINTS: PointMovement[] = [];
export const MOCK_RESERVATIONS: Reservation[] = [];
export const MOCK_PAYMENTS: Payment[] = [];
export const MOCK_SERVICES: Service[] = [];
export const MOCK_PROMOTIONS: Promotion[] = [];
