import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./config";

/**
 * Token en memoria para adjuntar en requests autenticadas.
 * Se puede sincronizar con SecureStore o AsyncStorage según se requiera.
 */
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = (): string | null => {
  return authToken;
};

/**
 * Instancia global de Axios preconfigurada para toda la app.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor para agregar headers (ej: Token de autenticación)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken && config.headers) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para respuestas y manejo centralizado de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    // Aquí se pueden capturar códigos de error como 401 (No autorizado) o errores de red
    const status = error.response?.status;
    const errorMessage =
      error.response?.data?.message || error.message || "Error de red inesperado";

    // Solo registrar warning en desarrollo si no es un 401/403 esperado
    if (__DEV__ && status !== 401 && status !== 403) {
      console.warn(`[API ERROR ${status || "NETWORK"}]: ${errorMessage}`);
    }

    return Promise.reject({
      status,
      message: errorMessage,
      rawError: error,
    });
  }
);
