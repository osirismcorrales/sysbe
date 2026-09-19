package com.sbe.backend.instalacion.dto;

import java.math.BigDecimal;

public record InstalacionResponseDto(
        Long id,
        String nombre,
        String descripcion,
        String estado,
        BigDecimal precio_base,
        Integer duracion_minutos
)

{
}
