import { apiClient } from "../client";
import { ENDPOINTS } from "../config";
import type {
  ReservaRequestDto,
  ReservaResponseDto,
  ReservaHistorialResponseDto,
  ReprogramarReservaRequestDto,
} from "../../data/types";

export type CreateReservationDTO = ReservaRequestDto | any;

export const reservationsService = {
  /**
   * Obtiene las reservas del usuario autenticado
   * GET /api/reservas/me
   */
  async obtenerMisReservas(): Promise<ReservaHistorialResponseDto[]> {
    const response = await apiClient.get<ReservaHistorialResponseDto[]>(
      ENDPOINTS.RESERVAS.ME
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Obtiene la lista de reservas históricas y activas de un usuario
   * GET /api/reservas/usuario/{idUsuario}
   */
  async obtenerHistorialUsuario(
    idUsuario: number | string
  ): Promise<ReservaHistorialResponseDto[]> {
    const response = await apiClient.get<ReservaHistorialResponseDto[]>(
      ENDPOINTS.RESERVAS.BY_USER(idUsuario)
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Crea una nueva reserva
   * POST /api/reservas
   */
  async crearReserva(dto: ReservaRequestDto): Promise<ReservaResponseDto> {
    const response = await apiClient.post<ReservaResponseDto>(
      ENDPOINTS.RESERVAS.CREATE,
      dto
    );
    return response.data;
  },

  /**
   * Cancela una reserva existente
   * PUT /api/reservas/{idReserva}/cancelar
   */
  async cancelarReserva(
    idReserva: number | string
  ): Promise<ReservaResponseDto> {
    const response = await apiClient.put<ReservaResponseDto>(
      ENDPOINTS.RESERVAS.CANCEL(idReserva)
    );
    return response.data;
  },

  /**
   * Reprograma una reserva existente a nueva fecha y horario
   * PUT /api/reservas/{idReserva}/reprogramar
   */
  async reprogramarReserva(
    idReserva: number | string,
    dto: ReprogramarReservaRequestDto
  ): Promise<ReservaResponseDto> {
    const response = await apiClient.put<ReservaResponseDto>(
      ENDPOINTS.RESERVAS.REPROGRAMAR(idReserva),
      dto
    );
    return response.data;
  },

  // ── Métodos para compatibilidad previa ──
  async getAll(): Promise<ReservaResponseDto[]> {
    return this.obtenerMisReservas();
  },
  async getById(id: string): Promise<any> {
    return null;
  },
  async create(data: any): Promise<any> {
    return null;
  },
  async cancel(id: string): Promise<any> {
    return this.cancelarReserva(id);
  },
};
