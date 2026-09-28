import { apiClient, setAuthToken } from "../client";
import { ENDPOINTS } from "../config";
import type { User, LoginRequestDto, LoginResponseDto } from "../../data/types";

export const authService = {
  /**
   * Autenticación con el backend Spring Boot: POST /api/auth/login
   */
  async login(request: LoginRequestDto): Promise<LoginResponseDto> {
    const response = await apiClient.post<LoginResponseDto>(ENDPOINTS.AUTH.LOGIN, request);
    const token =
      response.data.token || response.data.accessToken || response.data.jwt;

    if (token) {
      setAuthToken(token);
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
