package com.sbe.backend.reporte.dto;

public record SocioActivoReporteDto(
        String dniUsuario,
        String nombreUsuario,
        String tipoUsuario,
        String email,
        String estado
){
}
