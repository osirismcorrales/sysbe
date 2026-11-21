package com.sbe.backend.reporte.service;

import com.sbe.backend.reporte.dto.PagoReporteDto;
import com.sbe.backend.reporte.dto.ReporteFiltrosRequestDto;
import com.sbe.backend.reporte.dto.ReservaReporteDto;
import com.sbe.backend.reporte.dto.SocioActivoReporteDto;
import com.sbe.backend.reporte.repository.ReporteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReporteServiceImpl implements ReporteService {

    public final ReporteRepository reporteRepository;

    public ReporteServiceImpl(ReporteRepository reporteRepository) {
        this.reporteRepository = reporteRepository;
    }

    @Override
    public Page<ReservaReporteDto> obtenerReporteReservasPorServicio(ReporteFiltrosRequestDto filtros, Pageable pageable) {
        return reporteRepository.obtenerReporteReservas(
                filtros.dni(),
                filtros.nombreUsuario(),
                filtros.tipoUsuario(),
                filtros.tipoInstalacion(),
                filtros.estado(),
                filtros.fechaDesde(),
                filtros.fechaHasta(),
                pageable
        );
    }

    @Override
    public Page<ReservaReporteDto> obtenerReporteReservasPorFecha(ReporteFiltrosRequestDto filtros, Pageable pageable) {
        return reporteRepository.obtenerReporteReservas(
                filtros.dni(),
                filtros.nombreUsuario(),
                filtros.tipoUsuario(),
                filtros.tipoInstalacion(),
                filtros.estado(),
                filtros.fechaDesde(),
                filtros.fechaHasta(),
                pageable
        );
    }

    @Override
    public Page<SocioActivoReporteDto> obtenerReporteSociosActivos(ReporteFiltrosRequestDto filtros, Pageable pageable) {
        return reporteRepository.obtenerReporteSociosActivos(
                filtros.dni(),
                filtros.nombreUsuario(),
                filtros.tipoUsuario(),
                pageable
        );
    }

    @Override
    public Page<PagoReporteDto> obtenerReportePagos(ReporteFiltrosRequestDto filtros, Pageable pageable) {
        return reporteRepository.obtenerReportePagos(
                filtros.dni(),
                filtros.nombreUsuario(),
                filtros.tipoPago(),
                filtros.estado(),
                filtros.fechaDesde(),
                filtros.fechaHasta(),
                pageable
        );
    }

    @Override
    public List<ReservaReporteDto> obtenerReporteReservasPorServicio(ReporteFiltrosRequestDto filtros) {
        return reporteRepository.obtenerReporteReservas(
                filtros.dni(),
                filtros.nombreUsuario(),
                filtros.tipoUsuario(),
                filtros.tipoInstalacion(),
                filtros.estado(),
                filtros.fechaDesde(),
                filtros.fechaHasta()
        );
    }

    @Override
    public List<ReservaReporteDto> obtenerReporteReservasPorFecha(ReporteFiltrosRequestDto filtros) {
        return reporteRepository.obtenerReporteReservas(
                filtros.dni(),
                filtros.nombreUsuario(),
                filtros.tipoUsuario(),
                filtros.tipoInstalacion(),
                filtros.estado(),
                filtros.fechaDesde(),
                filtros.fechaHasta()
        );
    }

    @Override
    public List<SocioActivoReporteDto> obtenerReporteSociosActivos(ReporteFiltrosRequestDto filtros) {
        return reporteRepository.obtenerReporteSociosActivos(
                filtros.dni(),
                filtros.nombreUsuario(),
                filtros.tipoUsuario()
        );
    }

    @Override
    public List<PagoReporteDto> obtenerReportePagos(ReporteFiltrosRequestDto filtros) {
        return reporteRepository.obtenerReportePagos(
                filtros.dni(),
                filtros.nombreUsuario(),
                filtros.tipoPago(),
                filtros.estado(),
                filtros.fechaDesde(),
                filtros.fechaHasta()
        );
    }
}
