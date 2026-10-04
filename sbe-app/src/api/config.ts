/**
 * Configuración centralizada de la API.
 * 
 * Este es el ÚNICO lugar de la aplicación donde se define y gestiona
 * la URL base del backend y las rutas de los endpoints.
 *
 * La URL base puede actualizarse en tiempo de ejecución mediante
 * setApiBaseUrl() para permitir configurar la IP del servidor
 * desde la pantalla de login (útil para prototipos y demos en red WiFi).
 */

export let API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.10:8080/api";

/**
 * Actualiza la URL base de la API en tiempo de ejecución.
 * También actualiza la baseURL de la instancia de Axios ya creada.
 */
export function setApiBaseUrl(url: string): void {
  API_BASE_URL = url;
}

/**
 * Catálogo centralizado de endpoints de la aplicación.
 */
export const ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
  },

  // Usuario y Perfil (Spring Boot: @RequestMapping("/api/usuarios"))
  USER: {
    BY_ID: (id: string | number) => `/usuarios/${id}`,
    UPDATE_ME: "/usuarios/me",
    PROFILE: "/usuarios/me",
    MEMBERSHIP: "/usuarios/membership",
    POINTS: "/usuarios/points",
  },

  // Instalaciones (Spring Boot: @RequestMapping("/api/instalaciones"))
  INSTALACIONES: {
    LIST: "/instalaciones",
    DETAIL: (id: string | number) => `/instalaciones/${id}`,
  },

  // Disponibilidad y Plantillas Horarias (Spring Boot: @RequestMapping("/api/plantillas-horario"))
  HORARIOS: {
    DISPONIBILIDAD: (idInstalacion: number | string, fecha: string) =>
      `/plantillas-horario/disponibilidad?idInstalacion=${idInstalacion}&fecha=${fecha}`,
    PLANTILLAS: (idInstalacion?: number | string) =>
      idInstalacion
        ? `/plantillas-horario?idInstalacion=${idInstalacion}`
        : "/plantillas-horario",
  },

  // Reservas (Spring Boot: @RequestMapping("/api/reservas"))
  RESERVAS: {
    ME: "/reservas/me",
    CREATE: "/reservas",
    BY_USER: (idUsuario: number | string) => `/reservas/usuario/${idUsuario}`,
    CANCEL: (idReserva: number | string) => `/reservas/${idReserva}/cancelar`,
    REPROGRAMAR: (idReserva: number | string) => `/reservas/${idReserva}/reprogramar`,
  },
  RESERVATIONS: {
    LIST: "/reservas",
    DETAIL: (id: string | number) => `/reservas/${id}`,
    CREATE: "/reservas",
    CANCEL: (id: string | number) => `/reservas/${id}/cancelar`,
    REPROGRAMAR: (id: string | number) => `/reservas/${id}/reprogramar`,
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
