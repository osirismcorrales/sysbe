package com.sbe.backend.usuario.dto;

import com.sbe.backend.usuario.entity.RolUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO de REQUEST para crear o actualizar un Usuario.
 *
 * CONVENCIONES:
 *  - Los DTOs van en el paquete 'dto' de cada feature
 *  - Usar Bean Validation (@NotBlank, @Email, etc.) en los campos de request
 *  - Separar DTO de Request y Response (no mezclar)
 *  - Usar 'record' de Java 16+ para DTOs inmutables → menos boilerplate
 *
 * Por que record y no class?
 *  - Inmutable por defecto (campos final)
 *  - Constructor, getters, equals, hashCode y toString generados automaticamente
 *  - Ideal para DTOs que solo transportan datos
 */
public record UsuarioRequestDto(

        @NotBlank(message = "El nombre no puede estar vacio")
        String nombre,

        @NotBlank(message = "El apellido no puede estar vacio")
        String apellido,

        @NotBlank(message = "El email no puede estar vacio")
        @Email(message = "El email no tiene un formato valido")
        String email,

        @NotBlank(message = "La password no puede estar vacia")
        @Size(min = 8, message = "La password debe tener al menos 8 caracteres")
        String password,

        @NotNull(message = "El rol no puede ser nulo")
        RolUsuario rol
) {}
