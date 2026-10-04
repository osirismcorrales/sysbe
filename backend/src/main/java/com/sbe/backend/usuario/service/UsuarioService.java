package com.sbe.backend.usuario.service;

import com.sbe.backend.componentes.ValidadorDni;
import com.sbe.backend.usuario.dto.UsuarioRequestDto;
import com.sbe.backend.usuario.dto.UsuarioResponseDto;
import com.sbe.backend.usuario.dto.UsuarioUpdateDto;
import com.sbe.backend.usuario.dto.UsuarioUpdateMeDto;
import com.sbe.backend.usuario.entity.Categoria;
import com.sbe.backend.usuario.entity.Rol;
import com.sbe.backend.usuario.entity.Usuario;
import com.sbe.backend.usuario.mapper.UsuarioMapper;
import com.sbe.backend.usuario.repository.CategoriaRepository;
import com.sbe.backend.usuario.repository.RolRepository;
import com.sbe.backend.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.sbe.backend.usuario.specification.UsuarioSpecification;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

import static com.sbe.backend.usuario.entity.Usuario.EstadoUsuario.DE_BAJA;

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
        return usuarioRepository.findAll()
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

        if (!ValidadorDni.esValido(dto.dni())) {
            throw new IllegalArgumentException("El DNI ingresado no tiene un formato válido");
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
        usuario.setEstado(dto.estado());
        usuario.setPasswordHash(
                passwordEncoder.encode(dto.passwordHash())
        );

        Usuario guardado = usuarioRepository.save(usuario);

        return usuarioMapper.toResponseDto(guardado);
    }

    @Transactional
    public UsuarioResponseDto actualizar(Long id, UsuarioUpdateDto dto) {


        if (!ValidadorDni.esValido(dto.dni())) {
            throw new IllegalArgumentException("El DNI ingresado no tiene un formato válido");
        }

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

        usuario.setEstado(dto.estado());
        usuario.setRol(rol);
        usuario.setCategoria(categoria);


        return usuarioMapper.toResponseDto(usuario);
    }

    @Transactional
    public UsuarioResponseDto actualizarPerfilPropio(String dniActual, UsuarioUpdateMeDto dto) {
        // 1. Buscar al usuario actual usando el email verificado de la sesión
        Usuario usuario = usuarioRepository.findByDni(dniActual)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado con el dni: " + dniActual));

        // 2. Si intenta cambiar su email, verificar que nadie más lo esté usando
        if (!usuario.getEmail().equalsIgnoreCase(dto.email())) {
            if (usuarioRepository.existsByEmail(dto.email())) {
                throw new IllegalArgumentException("Ya existe un usuario con el email: " + dto.email());
            }
            usuario.setEmail(dto.email());
        }


        // 3. Modificar únicamente los datos permitidos por la regla RS-1.4
        usuario.setNombreCompleto(dto.nombreCompleto());
        usuario.setFechaNacimiento(dto.fechaNacimiento());
        usuario.setDomicilio(dto.domicilio());

        // 4. Si proporcionó una nueva contraseña, hashearla antes de guardarla
        if (dto.password() != null && !dto.password().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(dto.password()));
        }

        // Con @Transactional los cambios se sincronizan automáticamente en la base de datos
        return usuarioMapper.toResponseDto(usuario);
    }

    public UsuarioResponseDto buscarPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

        return usuarioMapper.toResponseDto(usuario);
    }

    public UsuarioResponseDto buscarPorDni(String dni) {
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

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

    @Transactional(readOnly = true)
    public Page<UsuarioResponseDto> listarConFiltros(String busqueda, Long idRol, String rolNombre, Usuario.EstadoUsuario estado, Pageable pageable) {
        Specification<Usuario> spec = UsuarioSpecification.conFiltros(busqueda, idRol, estado, rolNombre);
        return usuarioRepository.findAll(spec, pageable).map(usuarioMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public Page<UsuarioResponseDto> listarConFiltros(String busqueda, Long idRol, Usuario.EstadoUsuario estado, Pageable pageable) {
        return listarConFiltros(busqueda, idRol, null, estado, pageable);
    }
}
