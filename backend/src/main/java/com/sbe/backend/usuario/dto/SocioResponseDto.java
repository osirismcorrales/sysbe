package com.sbe.backend.usuario.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SocioResponseDto(
        Long idUsuario,
        String dni,
        String nombreCompleto,
        String email,
        String estado,
        Integer puntosAc,
        Integer idCategoria,
        String tipoSocio,
        String vinculoUnse,
        BigDecimal descuentoPorcentaje,  // null si tiene recargo
        BigDecimal recargoPorcentaje,    // null si tiene descuento
        LocalDate fechaAltaSocio         // fecha de auditoría
) {
}
