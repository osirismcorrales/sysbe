package com.sbe.backend.reporte.controller;

import com.sbe.backend.reporte.dto.ReporteFiltrosRequestDto;
import com.sbe.backend.reporte.dto.ReservaReporteDto;
import com.sbe.backend.reporte.dto.SocioActivoReporteDto;
import com.sbe.backend.reporte.service.ReporteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @PostMapping("/reservas-servicio")
    public ResponseEntity<List<ReservaReporteDto>> obtenerReporteReservasPorServicio(
            @RequestBody ReporteFiltrosRequestDto filtros) {
        List<ReservaReporteDto> reporte = reporteService.obtenerReporteReservasPorServicio(filtros);
        return ResponseEntity.ok(reporte);
    }

    @PostMapping("/reservas-fecha")
    public ResponseEntity<List<ReservaReporteDto>> obtenerReporteReservasPorFecha(
            @RequestBody ReporteFiltrosRequestDto filtros) {
        List<ReservaReporteDto> reporte = reporteService.obtenerReporteReservasPorFecha(filtros);
        return ResponseEntity.ok(reporte);
    }

    @PostMapping("/socios-activos")
    public ResponseEntity<List<SocioActivoReporteDto>> obtenerReporteSociosActivos(
            @RequestBody ReporteFiltrosRequestDto filtros) {
        List<SocioActivoReporteDto> reporte = reporteService.obtenerReporteSociosActivos(filtros);
        return ResponseEntity.ok(reporte);
    }

}
