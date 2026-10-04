// Configuración y URL centralizada
export { API_BASE_URL, ENDPOINTS, setApiBaseUrl } from "./config";

// Cliente HTTP Axios e interceptores
export { apiClient, setAuthToken, getAuthToken, updateApiBaseUrl } from "./client";

// Utilidades de almacenamiento de servidor (IP configurable)
export {
  saveServerUrl,
  getServerUrl,
  clearServerUrl,
  getDefaultUrl,
  buildApiUrl,
} from "./serverStorage";

// TanStack Query Client y Query Keys
export { queryClient } from "./queryClient";
export { queryKeys } from "./queryKeys";

// Servicios de API (Data layer)
export * from "./services";

// Hooks de TanStack Query
export * from "./hooks";
