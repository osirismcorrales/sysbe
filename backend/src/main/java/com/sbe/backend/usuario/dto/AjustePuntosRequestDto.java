package com.sbe.backend.usuario.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AjustePuntosRequestDto(
        @NotNull(message = "La cantidad de puntos es obligatoria.")
        @Positive(message = "La cantidad de puntos debe ser mayor a 0.")
        Integer puntos
) {
}
