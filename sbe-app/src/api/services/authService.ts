import { apiClient, setAuthToken } from "../client";
import { ENDPOINTS } from "../config";
import type { User } from "../../data/types";

export interface LoginCredentials {
  email?: string;
  dni?: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  /**
   * Autenticación con el backend
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, credentials);
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    return response.data;
  },

  /**
   * Obtiene la sesión actual
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>(ENDPOINTS.AUTH.ME);
    return response.data;
  },

  /**
   * Cierre de sesión y limpieza de credenciales
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Ignorar si el endpoint de logout falla en servidor
    } finally {
      setAuthToken(null);
    }
  },
};
