export type TipoReporte = 'reservas' | 'socios-activos';

export interface ReporteFiltrosRequestDto {
  nombreUsuario?: string;
  tipoUsuario?: string;
  tipoServicio?: string; 
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface ReservaReporteDto {
  dni: string;
  nombreUsuario: string;
  tipoSocio: string;
  instalacion: string; 
  servicio?: string;   
  fechaReserva: string;
  estado: string;
}

export interface SocioActivoReporteDto {
  dni: string;
  nombreCompleto: string;
  tipoSocio: string;
  email: string;
  estado: string;
}