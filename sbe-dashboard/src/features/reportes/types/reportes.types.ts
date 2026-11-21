export type TipoReporte = 'reservas' | 'socios-activos' | 'pagos';

export interface ReporteFiltrosRequestDto {
  dni?: string;
  nombreUsuario?: string;
  tipoUsuario?: string;
  tipoServicio?: string;
  tipoInstalacion?: string;
  tipoPago?: string;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface ReservaReporteDto {
  dniUsuario: string;
  nombreUsuario: string;
  tipoUsuario: string;
  tipoInstalacion: string;
  fechaReserva: string;
  estado: string;
}

export interface SocioActivoReporteDto {
  dniUsuario: string;
  nombreUsuario: string;
  tipoUsuario: string;
  email: string;
  estado: string;
}

export interface PagoReporteDto {
  idPago: number;
  dniUsuario: string;
  nombreUsuario: string;
  tipoPago: string;
  periodo: string | null;
  idReserva: number | null;
  montoPago: number;
  metodoPago: string;
  estadoPago: string;
  fechaCreacion: string;
  fechaPago: string | null;
}

export interface GrupoReservasPersona {
  dniUsuario: string;
  nombreUsuario: string;
  tipoUsuario: string;
  totalMovimientos: number;
  totalCancelados: number;
  reservas: ReservaReporteDto[];
}

export interface FiltroItem {
  etiqueta: string;
  valor: string;
}

export interface ReporteMetadata {
  filtrosAplicados: FiltroItem[];
  fechaHoraEmision: string;
  usuarioGenerador: string;
  totalRegistros: number;
}
