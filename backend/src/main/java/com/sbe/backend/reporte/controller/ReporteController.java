package com.sbe.backend.reporte.controller;

import com.sbe.backend.reporte.dto.ReporteFiltrosRequestDto;
import com.sbe.backend.reporte.dto.ReservaReporteDto;
import com.sbe.backend.reporte.dto.SocioActivoReporteDto;
import com.sbe.backend.reporte.service.ReporteService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @PostMapping("/reservas-servicio")
    public ResponseEntity<Page<ReservaReporteDto>> obtenerReporteReservasPorServicio(
            @RequestBody ReporteFiltrosRequestDto filtros,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<ReservaReporteDto> reporte = reporteService.obtenerReporteReservasPorServicio(filtros, pageable);
        return ResponseEntity.ok(reporte);
    }

    @PostMapping("/reservas-fecha")
    public ResponseEntity<Page<ReservaReporteDto>> obtenerReporteReservasPorFecha(
            @RequestBody ReporteFiltrosRequestDto filtros,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<ReservaReporteDto> reporte = reporteService.obtenerReporteReservasPorFecha(filtros, pageable);
        return ResponseEntity.ok(reporte);
    }

    @PostMapping("/socios-activos")
    public ResponseEntity<Page<SocioActivoReporteDto>> obtenerReporteSociosActivos(
            @RequestBody ReporteFiltrosRequestDto filtros,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<SocioActivoReporteDto> reporte = reporteService.obtenerReporteSociosActivos(filtros, pageable);
        return ResponseEntity.ok(reporte);
    }

}
