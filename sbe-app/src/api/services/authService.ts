import { apiClient, setAuthToken } from "../client";
import { ENDPOINTS } from "../config";
import type { User, LoginRequestDto, LoginResponseDto } from "../../data/types";

export const authService = {
  /**
   * Autenticación con el backend Spring Boot: POST /api/auth/login
   */
  async login(request: LoginRequestDto): Promise<LoginResponseDto> {
    const response = await apiClient.post<LoginResponseDto>(ENDPOINTS.AUTH.LOGIN, request);

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
   * Cierre de sesión y limpieza local del token JWT (stateless).
   * No requiere llamada HTTP al backend.
   */
  logout(): void {
    setAuthToken(null);
  },
};
