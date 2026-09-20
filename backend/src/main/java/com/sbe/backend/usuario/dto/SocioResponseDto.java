package com.sbe.backend.usuario.dto;

import java.math.BigDecimal;

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
        BigDecimal descuentoPorcentaje
) {
}
