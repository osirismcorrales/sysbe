package com.sbe.backend.usuario.service;

import com.sbe.backend.usuario.dto.UsuarioRequestDto;
import com.sbe.backend.usuario.dto.UsuarioResponseDto;
import com.sbe.backend.usuario.entity.Categoria;
import com.sbe.backend.usuario.entity.Rol;
import com.sbe.backend.usuario.entity.Usuario;
import com.sbe.backend.usuario.mapper.UsuarioMapper;
import com.sbe.backend.usuario.repository.CategoriaRepository;
import com.sbe.backend.usuario.repository.RolRepository;
import com.sbe.backend.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

import static com.sbe.backend.usuario.entity.Usuario.EstadoUsuario.DE_BAJA;
import static com.sbe.backend.usuario.entity.Usuario.EstadoUsuario.ACTIVO;

@Service
@RequiredArgsConstructor

public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final RolRepository rolRepository;
    private final CategoriaRepository categoriaRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UsuarioResponseDto> listarTodos() {
        return usuarioRepository.findByEstado(ACTIVO)
                .stream()
                .map(usuarioMapper::toResponseDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDto buscarPorId(Long id) {
        Usuario usuario = findOrThrow(id);
        return usuarioMapper.toResponseDto(usuario);
    }



    @Transactional
    public UsuarioResponseDto crear(UsuarioRequestDto dto) {

        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException(
                    "Ya existe un usuario con el email: " + dto.email()
            );
        }

        Usuario usuario = usuarioMapper.toEntity(dto);

        Rol rol = rolRepository.findById(dto.rolId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Rol no encontrado")
                );

        Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Categoría no encontrada")
                );

        usuario.setRol(rol);
        usuario.setCategoria(categoria);

        usuario.setPasswordHash(
                passwordEncoder.encode(dto.passwordHash())
        );

        Usuario guardado = usuarioRepository.save(usuario);

        return usuarioMapper.toResponseDto(guardado);
    }

    @Transactional
    public UsuarioResponseDto actualizar(Long id, UsuarioRequestDto dto) {

        Usuario usuario = findOrThrow(id);

        usuario.setNombreCompleto(dto.nombreCompleto());

        Rol rol = rolRepository.findById(dto.rolId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Rol no encontrado")
                );

        Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Categoría no encontrada")
                );

        usuario.setRol(rol);
        usuario.setCategoria(categoria);

        if (dto.passwordHash() != null && !dto.passwordHash().isBlank()) {
            usuario.setPasswordHash(
                    passwordEncoder.encode(dto.passwordHash())
            );
        }

        return usuarioMapper.toResponseDto(usuario);
    }

    @Transactional
    public void desactivar(Long id) {
        Usuario usuario = findOrThrow(id);
        usuario.setEstado(DE_BAJA);
    }

    private Usuario findOrThrow(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado con id: " + id));
    }
}
