package com.sbe.backend.reporte.service;

import com.sbe.backend.reporte.dto.ReporteFiltrosRequestDto;
import com.sbe.backend.reporte.dto.ReservaReporteDto;
import com.sbe.backend.reporte.dto.SocioActivoReporteDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReporteService {

    Page<ReservaReporteDto> obtenerReporteReservasPorServicio(ReporteFiltrosRequestDto filtros, Pageable pageable);

    Page<ReservaReporteDto> obtenerReporteReservasPorFecha(ReporteFiltrosRequestDto filtros, Pageable pageable);

    Page<SocioActivoReporteDto> obtenerReporteSociosActivos(ReporteFiltrosRequestDto filtros, Pageable pageable);

    List<ReservaReporteDto> obtenerReporteReservasPorServicio(ReporteFiltrosRequestDto filtros);

    List<ReservaReporteDto> obtenerReporteReservasPorFecha(ReporteFiltrosRequestDto filtros);

    List<SocioActivoReporteDto> obtenerReporteSociosActivos(ReporteFiltrosRequestDto filtros);
}
