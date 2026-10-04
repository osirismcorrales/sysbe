export type TipoReporte = 'reservas' | 'socios-activos';

export interface ReporteFiltrosRequestDto {
  nombreUsuario?: string;
  tipoUsuario?: string;
  tipoServicio?: string; 
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface ReservaReporteDto {
  dni?: string;
  dniUsuario?: string;
  nombreUsuario: string;
  tipoUsuario?: string;
  tipoSocio?: string;
  tipoInstalacion?: string;
  instalacion?: string; 
  servicio?: string;   
  fechaReserva: string;
  estado: string;
}

export interface SocioActivoReporteDto {
  dni?: string;
  dniUsuario?: string;
  nombreCompleto?: string;
  nombreUsuario?: string;
  tipoUsuario?: string;
  tipoSocio?: string;
  email: string;
  estado: string;
}