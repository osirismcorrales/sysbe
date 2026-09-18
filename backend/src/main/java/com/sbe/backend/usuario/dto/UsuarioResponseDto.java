package com.sbe.backend.usuario.dto;

import com.sbe.backend.usuario.entity.RolUsuario;

/**
 * DTO de RESPONSE para devolver datos de un Usuario al cliente.
 *
 * CONVENCIONES:
 *  - NUNCA incluir la password ni datos sensibles en el Response DTO
 *  - Solo exponer los campos que el frontend necesita
 *  - Los records son perfectos para responses: inmutables y concisos
 */
public record UsuarioResponseDto(
        Long id,
        String nombre,
        String apellido,
        String email,
        RolUsuario rol,
        boolean activo
) {}
