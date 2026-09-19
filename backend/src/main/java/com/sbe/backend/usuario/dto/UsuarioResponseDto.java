package com.sbe.backend.usuario.dto;

import com.sbe.backend.usuario.entity.Categoria;
import com.sbe.backend.usuario.entity.Rol;
import com.sbe.backend.usuario.entity.Usuario;

import java.time.LocalDateTime;

public record UsuarioResponseDto(Long id,
                                 String dni,
                                 String nombreCompleto,
                                 String email,
                                 LocalDateTime fechaNacimiento,
                                 Integer puntosAc,
                                 Usuario.EstadoUsuario estado,
                                 String domicilio,
                                 Rol rol,
                                 Categoria categoria
                                      ) {
}
