package com.sbe.backend.usuario.service;

import com.sbe.backend.usuario.dto.UsuarioRequestDto;
import com.sbe.backend.usuario.dto.UsuarioResponseDto;
import com.sbe.backend.usuario.entity.Usuario;
import com.sbe.backend.usuario.mapper.UsuarioMapper;
import com.sbe.backend.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * Implementacion del servicio de Usuario.
 *
 * CONVENCIONES:
 *  - @Service marca la clase como bean de Spring
 *  - @RequiredArgsConstructor (Lombok) genera el constructor con todos los campos 'final'
 *    → es la forma recomendada de hacer Dependency Injection (en vez de @Autowired en campo)
 *  - @Transactional en metodos que modifican la DB para garantizar atomicidad
 *  - La logica de negocio va AQUI, no en el Controller ni en el Repository
 */
@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    // Inyeccion por constructor gracias a @RequiredArgsConstructor + final
    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDto> listarTodos() {
        return usuarioRepository.findByActivoTrue()
                .stream()
                .map(usuarioMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDto buscarPorId(Long id) {
        Usuario usuario = findOrThrow(id);
        return usuarioMapper.toResponseDto(usuario);
    }

    @Override
    @Transactional
    public UsuarioResponseDto crear(UsuarioRequestDto dto) {
        // Validacion de negocio: email unico
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Ya existe un usuario con el email: " + dto.email());
        }

        Usuario usuario = usuarioMapper.toEntity(dto);
        // Hashear password ANTES de guardar
        usuario.setPassword(passwordEncoder.encode(dto.password()));

        Usuario guardado = usuarioRepository.save(usuario);
        return usuarioMapper.toResponseDto(guardado);
    }

    @Override
    @Transactional
    public UsuarioResponseDto actualizar(Long id, UsuarioRequestDto dto) {
        Usuario usuario = findOrThrow(id);

        // Actualizar solo los campos permitidos
        usuario.setNombre(dto.nombre());
        usuario.setApellido(dto.apellido());
        usuario.setRol(dto.rol());

        // Si la password viene en el request, actualizarla hasheada
        if (dto.password() != null && !dto.password().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(dto.password()));
        }

        // No hace falta llamar a save() explicitamente dentro de @Transactional
        // porque Hibernate detecta los cambios en la entidad "managed" automaticamente
        return usuarioMapper.toResponseDto(usuario);
    }

    @Override
    @Transactional
    public void desactivar(Long id) {
        Usuario usuario = findOrThrow(id);
        usuario.setActivo(false);
        // Baja logica: el registro queda en la DB pero inactivo
    }

    // -----------------------------------------------
    // Metodos privados de ayuda
    // -----------------------------------------------

    /**
     * Busca un Usuario por ID o lanza una excepcion estandar.
     * Centralizar esta logica evita duplicar el mensaje de error.
     */
    private Usuario findOrThrow(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado con id: " + id));
    }
}
