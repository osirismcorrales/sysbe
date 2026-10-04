package com.sbe.backend.reporte.service;

import com.sbe.backend.reporte.dto.ReporteFiltrosRequestDto;
import com.sbe.backend.reporte.dto.ReservaReporteDto;
import com.sbe.backend.reporte.dto.SocioActivoReporteDto;

import java.util.List;

public interface ReporteService {

    List<ReservaReporteDto> obtenerReporteReservasPorServicio(ReporteFiltrosRequestDto filtros);

    List<ReservaReporteDto> obtenerReporteReservasPorFecha(ReporteFiltrosRequestDto filtros);

    List<SocioActivoReporteDto> obtenerReporteSociosActivos(ReporteFiltrosRequestDto filtros);
}
