package com.sbe.backend.usuario.service;

import com.sbe.backend.usuario.dto.UsuarioRequestDto;
import com.sbe.backend.usuario.dto.UsuarioResponseDto;

import java.util.List;

/**
 * Interfaz del servicio de Usuario.
 *
 * CONVENCIONES:
 *  - Definir la interfaz aqui y la implementacion en UsuarioServiceImpl
 *  - Esto permite mockear facilmente en tests y desacoplar capas
 *  - El Controller solo conoce esta interfaz, nunca la implementacion
 */
public interface UsuarioService {

    /** Retorna todos los usuarios activos */
    List<UsuarioResponseDto> listarTodos();

    /** Busca un usuario por su ID. Lanza excepcion si no existe. */
    UsuarioResponseDto buscarPorId(Long id);

    /** Crea un nuevo usuario. Valida que el email no este en uso. */
    UsuarioResponseDto crear(UsuarioRequestDto dto);

    /** Actualiza los datos de un usuario existente. */
    UsuarioResponseDto actualizar(Long id, UsuarioRequestDto dto);

    /** Baja logica: marca el usuario como inactivo sin eliminarlo de la DB. */
    void desactivar(Long id);
}
