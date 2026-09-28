import { apiClient } from "../client";
import { ENDPOINTS } from "../config";
import type {
  User,
  Membership,
  PointMovement,
  Promotion,
  UsuarioResponseDto,
  UsuarioUpdateMeDto,
} from "../../data/types";

export const userService = {
  /**
   * Obtiene la información de perfil de un usuario por su ID
   * GET http://localhost:8080/api/usuarios/{id}
   */
  async getById(id: string | number): Promise<UsuarioResponseDto> {
    const response = await apiClient.get<UsuarioResponseDto>(ENDPOINTS.USER.BY_ID(id));
    return response.data;
  },

  /**
   * Actualiza el perfil propio del usuario autenticado
   * PUT http://localhost:8080/api/usuarios/me
   */
  async updateMe(dto: UsuarioUpdateMeDto): Promise<UsuarioResponseDto> {
    const response = await apiClient.put<UsuarioResponseDto>(ENDPOINTS.USER.UPDATE_ME, dto);
    return response.data;
  },

  /**
   * Obtiene los datos del perfil del usuario actual (/usuarios/me)
   */
  async getProfile(): Promise<UsuarioResponseDto> {
    const response = await apiClient.get<UsuarioResponseDto>(ENDPOINTS.USER.PROFILE);
    return response.data;
  },

  /**
   * Actualiza datos parciales del perfil del usuario (alias conveniente de updateMe)
   */
  async updateProfile(partial: UsuarioUpdateMeDto): Promise<UsuarioResponseDto> {
    return this.updateMe(partial);
  },

  /**
   * Obtiene la información de membresía y estado de cuota
   */
  async getMembership(): Promise<Membership> {
    const response = await apiClient.get<Membership>(ENDPOINTS.USER.MEMBERSHIP);
    return response.data;
  },

  /**
   * Obtiene el historial de movimientos de puntos del usuario
   */
  async getPoints(): Promise<PointMovement[]> {
    const response = await apiClient.get<PointMovement[]>(ENDPOINTS.USER.POINTS);
    return response.data;
  },

  /**
   * Obtiene el catálogo de promociones canjeables
   */
  async getPromotions(): Promise<Promotion[]> {
    const response = await apiClient.get<Promotion[]>(ENDPOINTS.PROMOTIONS.LIST);
    return response.data;
  },

  /**
   * Canjea una promoción por puntos
   */
  async redeemPromotion(promoId: string): Promise<{ success: boolean; pointsDeducted: number }> {
    const response = await apiClient.post<{ success: boolean; pointsDeducted: number }>(
      ENDPOINTS.PROMOTIONS.REDEEM(promoId)
    );
    return response.data;
  },
};
