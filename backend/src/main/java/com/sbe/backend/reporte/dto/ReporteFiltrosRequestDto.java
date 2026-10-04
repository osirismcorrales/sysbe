package com.sbe.backend.reporte.dto;

import java.time.LocalDate;

public record ReporteFiltrosRequestDto(

        String nombreUsuario,
        String tipoUsuario,
        String tipoInstalacion,
        LocalDate fechaDesde,
        LocalDate fechaHasta

) {
}
