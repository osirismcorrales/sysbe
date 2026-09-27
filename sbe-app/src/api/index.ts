// Configuración y URL centralizada
export { API_BASE_URL, ENDPOINTS } from "./config";

// Cliente HTTP Axios e interceptores
export { apiClient, setAuthToken, getAuthToken } from "./client";

// TanStack Query Client y Query Keys
export { queryClient } from "./queryClient";
export { queryKeys } from "./queryKeys";

// Servicios de API (Data layer)
export * from "./services";

// Hooks de TanStack Query
export * from "./hooks";
