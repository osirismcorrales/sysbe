package com.sbe.backend.instalacion.dto;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record InstalacionRequestDto(

        @NotBlank
        @Size(min = 1, max = 60)
        String nombre,

        @NotBlank
        @Size(min = 1, max = 60)
        String descripcion,

        @NotBlank
        @Size(min = 1, max = 40)
        String estado,

        @NotNull
        @Min(0)
        BigDecimal precioBase,

        @NotNull
        @Min(0)
        Integer duracionMinutos
) {
}
