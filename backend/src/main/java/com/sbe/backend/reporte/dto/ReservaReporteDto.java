package com.sbe.backend.reporte.dto;

import java.time.LocalDate;

public record ReservaReporteDto(
        String dniUsuario,
        String nombreUsuario,
        String tipoUsuario,
        String tipoInstalacion,
        LocalDate fechaReserva,
        String estado
){
}
