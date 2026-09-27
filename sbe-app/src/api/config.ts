/**
 * Configuración centralizada de la API.
 * 
 * Este es el ÚNICO lugar de la aplicación donde se define y gestiona
 * la URL base del backend y las rutas de los endpoints.
 */

// Si existe la variable de entorno EXPO_PUBLIC_API_URL (por ejemplo en .env), se usará esa;
// de lo contrario, se usa la URL default configurable aquí.
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:3000/api";

/**
 * Catálogo centralizado de endpoints de la aplicación.
 */
export const ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
  },

  // Usuario y Perfil
  USER: {
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    MEMBERSHIP: "/users/membership",
    POINTS: "/users/points",
  },

  // Servicios deportivos/instalaciones
  SERVICES: {
    LIST: "/services",
    DETAIL: (id: string) => `/services/${id}`,
    SLOTS: (id: string, date: string) => `/services/${id}/slots?date=${date}`,
  },

  // Reservas
  RESERVATIONS: {
    LIST: "/reservations",
    DETAIL: (id: string) => `/reservations/${id}`,
    CREATE: "/reservations",
    CANCEL: (id: string) => `/reservations/${id}/cancel`,
  },

  // Pagos
  PAYMENTS: {
    LIST: "/payments",
    DETAIL: (id: string) => `/payments/${id}`,
    CREATE: "/payments",
    PAY_MEMBERSHIP: "/payments/membership",
  },

  // Promociones y Puntos
  PROMOTIONS: {
    LIST: "/promotions",
    REDEEM: (id: string) => `/promotions/${id}/redeem`,
  },
} as const;
