package com.sbe.backend.instalacion.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record InstalacionRequestDto(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 1, max = 60, message = "El nombre no puede superar los 60 caracteres")
        String nombre,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(min = 1, max = 60, message = "La descripción no puede superar los 60 caracteres")
        String descripcion,

        @NotBlank(message = "El estado es obligatorio")
        @Size(min = 1, max = 40, message = "El estado no puede superar los 40 caracteres")
        String estado,

        @NotNull(message = "El precio base es obligatorio")
        @DecimalMin(value = "0.0", inclusive = false, message = "El precio base debe ser mayor a 0")
        BigDecimal precioBase,

        @NotNull(message = "La duración en minutos es obligatoria")
        @Min(value = 1, message = "La duración en minutos debe ser mayor a 0")
        Integer duracionMinutos
) {
}
