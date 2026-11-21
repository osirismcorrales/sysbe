package com.sbe.backend.reporte.dto;

import java.time.LocalDate;

public record ReporteFiltrosRequestDto(

        String dni,
        String nombreUsuario,
        String tipoUsuario,
        String tipoInstalacion,
        String tipoPago,
        String estado,
        LocalDate fechaDesde,
        LocalDate fechaHasta

) {
}
