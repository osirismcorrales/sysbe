package com.sbe.backend.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequestDto(

        @NotBlank(message = "El DNI no puede estar vacío")
        @Size(min = 7, max = 8, message = "El DNI debe tener entre 7 y 8 números")
        String dni,

        @NotBlank(message = "La contraseña no puede estar vacía")
        String password
) {
}
