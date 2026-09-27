package com.sbe.backend.usuario.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record UsuarioUpdateMeDto(
        @NotBlank(message = "El nombre completo no puede estar vacío")
        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
        String nombreCompleto,

        @NotBlank(message = "El email no puede estar vacío")
        @Email(message = "El email no tiene un formato válido")
        @Size(max = 120, message = "El email no puede superar los 120 caracteres")
        String email,

        @NotNull(message = "La fecha de nacimiento no puede ser vacía.")
        @Past(message = "La fecha de nacimiento debe ser una fecha pasada.")
        LocalDateTime fechaNacimiento,

        @NotBlank(message = "El domicilio no puede estar vacío")
        @Size(max = 100, message = "El domicilio no puede superar los 100 caracteres")
        String domicilio,

        // Opcional: solo se envía si el usuario desea cambiar su clave
        @Size(min = 8, message = "La nueva contraseña debe tener al menos 8 caracteres")
        String password
) {
}
