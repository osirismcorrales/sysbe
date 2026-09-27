import { apiClient } from "../client";
import { ENDPOINTS } from "../config";
import type { User, Membership, PointMovement, Promotion } from "../../data/types";

export const userService = {
  /**
   * Obtiene los datos del perfil del usuario actual
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>(ENDPOINTS.USER.PROFILE);
    return response.data;
  },

  /**
   * Actualiza datos parciales del perfil del usuario
   */
  async updateProfile(partial: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>(ENDPOINTS.USER.UPDATE_PROFILE, partial);
    return response.data;
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
