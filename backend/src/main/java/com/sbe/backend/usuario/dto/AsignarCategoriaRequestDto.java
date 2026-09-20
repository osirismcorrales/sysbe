package com.sbe.backend.usuario.dto;

import jakarta.validation.constraints.NotNull;

public record AsignarCategoriaRequestDto(
        @NotNull(message = "El ID de la categoría es obligatorio.")
        Integer categoriaId
) {
}
