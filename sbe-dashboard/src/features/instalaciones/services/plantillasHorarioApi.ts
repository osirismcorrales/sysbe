/**
 * plantillasHorarioApi.ts
 * Servicio API para conectar con el backend de Spring Boot: PlantillaHorarioController (/api/plantillas-horario)
 */

import { apiClient } from '../../../lib/apiClient';

// ─── DTOs del backend ────────────────────────────────────────────────────────

export type DiaSemana =
  | 'LUNES'
  | 'MARTES'
  | 'MIERCOLES'
  | 'JUEVES'
  | 'VIERNES'
  | 'SABADO'
  | 'DOMINGO';

export interface BloqueDto {
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
}

export interface PlantillaHorarioRequestDto {
  idInstalacion: number;
  diaSemana: DiaSemana;
  horaInicio: string; // "HH:mm" o "HH:mm:ss"
  horaFin: string;    // "HH:mm" o "HH:mm:ss"
}

export interface PlantillaHorarioResponseDto {
  id: number;
  idInstalacion: number;
  nombreInstalacion?: string;
  diaSemana: DiaSemana;
  horaInicio: string; // "HH:mm:ss" o "HH:mm"
  horaFin: string;    // "HH:mm:ss" o "HH:mm"
}

// ─── Mapeos y utilidades de días ─────────────────────────────────────────────

export interface DiaConfig {
  key: DiaSemana;
  label: string;
  shortLabel: string;
}

export const DIAS_SEMANA_CONFIG: DiaConfig[] = [
  { key: 'LUNES', label: 'Lunes', shortLabel: 'Lun' },
  { key: 'MARTES', label: 'Martes', shortLabel: 'Mar' },
  { key: 'MIERCOLES', label: 'Miércoles', shortLabel: 'Mié' },
  { key: 'JUEVES', label: 'Jueves', shortLabel: 'Jue' },
  { key: 'VIERNES', label: 'Viernes', shortLabel: 'Vie' },
  { key: 'SABADO', label: 'Sábado', shortLabel: 'Sáb' },
  { key: 'DOMINGO', label: 'Domingo', shortLabel: 'Dom' },
];

export const DIA_SEMANA_TO_LABEL: Record<DiaSemana, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

export const LABEL_TO_DIA_SEMANA: Record<string, DiaSemana> = {
  Lunes: 'LUNES',
  Martes: 'MARTES',
  Miércoles: 'MIERCOLES',
  Miercoles: 'MIERCOLES',
  Jueves: 'JUEVES',
  Viernes: 'VIERNES',
  Sábado: 'SABADO',
  Sabado: 'SABADO',
  Domingo: 'DOMINGO',
};

/**
 * Convierte un objeto Date o string "YYYY-MM-DD" al enum DiaSemana.
 */
export function getDiaSemanaFromDate(dateInput: string | Date): DiaSemana {
  const d = typeof dateInput === 'string'
    ? new Date(dateInput.includes('T') ? dateInput : `${dateInput}T12:00:00`)
    : dateInput;
  const dayIndex = d.getDay(); // 0 = Domingo, 1 = Lunes, ...
  const map: Record<number, DiaSemana> = {
    0: 'DOMINGO',
    1: 'LUNES',
    2: 'MARTES',
    3: 'MIERCOLES',
    4: 'JUEVES',
    5: 'VIERNES',
    6: 'SABADO',
  };
  return map[dayIndex] || 'LUNES';
}

/**
 * Normaliza una hora ("HH:mm:ss" -> "HH:mm")
 */
export function formatHora(timeStr?: string): string {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
}

/**
 * Calcula la duración en horas entre horaInicio y horaFin ("HH:mm")
 */
export function calcDuracionHoras(horaInicio: string, horaFin: string): number {
  if (!horaInicio || !horaFin) return 0;
  const [h1, m1] = horaInicio.split(':').map(Number);
  const [h2, m2] = horaFin.split(':').map(Number);
  const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  return diff > 0 ? Number((diff / 60).toFixed(1)) : 0;
}

// ─── Endpoint base ───────────────────────────────────────────────────────────

const RESOURCE = '/plantillas-horario';

// ─── Métodos de API ──────────────────────────────────────────────────────────

/**
 * GET /api/plantillas-horario
 * Puede filtrar opcionalmente por idInstalacion
 */
export async function listarPlantillas(
  idInstalacion?: number
): Promise<PlantillaHorarioResponseDto[]> {
  const query = idInstalacion != null ? `?idInstalacion=${idInstalacion}` : '';
  const data = await apiClient.get<PlantillaHorarioResponseDto[]>(`${RESOURCE}${query}`);
  return Array.isArray(data) ? data : [];
}

/**
 * GET /api/plantillas-horario/{id}
 */
export async function buscarPlantillaPorId(
  id: number
): Promise<PlantillaHorarioResponseDto> {
  return apiClient.get<PlantillaHorarioResponseDto>(`${RESOURCE}/${id}`);
}

/**
 * POST /api/plantillas-horario
 */
export async function crearPlantilla(
  dto: PlantillaHorarioRequestDto
): Promise<PlantillaHorarioResponseDto> {
  return apiClient.post<PlantillaHorarioResponseDto>(RESOURCE, {
    ...dto,
    horaInicio: formatHora(dto.horaInicio),
    horaFin: formatHora(dto.horaFin),
  });
}

/**
 * PUT /api/plantillas-horario/{id}
 */
export async function actualizarPlantilla(
  id: number,
  dto: PlantillaHorarioRequestDto
): Promise<PlantillaHorarioResponseDto> {
  return apiClient.put<PlantillaHorarioResponseDto>(`${RESOURCE}/${id}`, {
    ...dto,
    horaInicio: formatHora(dto.horaInicio),
    horaFin: formatHora(dto.horaFin),
  });
}

/**
 * DELETE /api/plantillas-horario/{id}
 */
export async function eliminarPlantilla(id: number): Promise<void> {
  await apiClient.del(`${RESOURCE}/${id}`);
}

/**
 * GET /api/plantillas-horario/disponibilidad?idInstalacion={id}&fecha={fecha}
 * Devuelve los bloques de horario calculados por el backend con el flag disponible: true/false.
 */
export async function consultarDisponibilidad(
  idInstalacion: number,
  fecha: string
): Promise<BloqueDto[]> {
  const data = await apiClient.get<BloqueDto[]>(
    `${RESOURCE}/disponibilidad?idInstalacion=${idInstalacion}&fecha=${fecha}`
  );
  return Array.isArray(data) ? data : [];
}
