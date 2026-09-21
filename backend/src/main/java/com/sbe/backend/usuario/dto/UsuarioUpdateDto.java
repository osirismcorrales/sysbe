package com.sbe.backend.usuario.dto;

import com.sbe.backend.usuario.entity.Usuario;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record UsuarioUpdateDto(
        @NotBlank(message = "El DNI no puede estar vacío.")
        @Size(min = 7, message = "El DNI debe ser como mínimo de 7 números.")
        @Size(max = 8, message = "El DNI debe tener como máximo 8 dígitos.") String dni,

        @NotBlank(message = "El nombre no puede estar vacío")
        String nombreCompleto,


        @NotBlank(message = "El email no puede estar vacio")
        @Email(message = "El email no tiene un formato valido")
        String email,

        @NotNull(message = "La fecha de nacimiento no puede ser vacía.")
        @PastOrPresent(message = "La fecha de nacimiento no puede ser una fecha futura.")
        LocalDateTime fechaNacimiento,

        @NotNull(message = "El estado no puede ser nulo.")
        Usuario.EstadoUsuario estado,

        String domicilio,



        @NotNull(message = "El rol no puede ser nulo")
        Integer rolId,

        @NotNull(message = "La categoría no puede ser nula.")
        Integer categoriaId
) {}