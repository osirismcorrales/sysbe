package com.sbe.backend.usuario.service;

import com.sbe.backend.usuario.dto.UsuarioRequestDto;
import com.sbe.backend.usuario.dto.UsuarioResponseDto;
import com.sbe.backend.usuario.dto.UsuarioUpdateDto;
import com.sbe.backend.usuario.dto.UsuarioUpdateMeDto;
import com.sbe.backend.usuario.entity.Categoria;
import com.sbe.backend.usuario.entity.Rol;
import com.sbe.backend.usuario.entity.Usuario;
import com.sbe.backend.usuario.entity.Usuario.EstadoUsuario;
import com.sbe.backend.usuario.mapper.UsuarioMapper;
import com.sbe.backend.usuario.repository.CategoriaRepository;
import com.sbe.backend.usuario.repository.RolRepository;
import com.sbe.backend.usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private UsuarioMapper usuarioMapper;

    @Mock
    private RolRepository rolRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    private UsuarioRequestDto usuarioRequestDto;
    private Usuario usuarioEntity;
    private Usuario usuarioGuardado;
    private UsuarioResponseDto usuarioResponseDto;
    private Rol rol;
    private Categoria categoria;

    @BeforeEach
    void setUp() {
        LocalDateTime fechaNac = LocalDateTime.of(1995, 5, 20, 0, 0);

        usuarioRequestDto = new UsuarioRequestDto(
                "38123456",
                "Carlos Gomez",
                "carlos.gomez@example.com",
                fechaNac,
                EstadoUsuario.ACTIVO,
                "Calle Falsa 123",
                "passwordSegura123",
                1,
                2
        );

        rol = Rol.builder()
                .idRol(1)
                .nombreRol("RECEPCIONISTA")
                .desc("Personal de recepcion")
                .build();

        categoria = Categoria.builder()
                .idCategoria(2)
                .tipoSocio("SOCIO_INTERNO")
                .descuento(BigDecimal.valueOf(15.00))
                .cuotaMensual(BigDecimal.valueOf(5000))
                .cuotaTrimestral(BigDecimal.valueOf(14000))
                .cuotaAnual(BigDecimal.valueOf(50000))
                .build();

        usuarioEntity = Usuario.builder()
                .dni("38123456")
                .nombreCompleto("Carlos Gomez")
                .email("carlos.gomez@example.com")
                .fechaNacimiento(fechaNac)
                .puntosAc(0)
                .estado(EstadoUsuario.ACTIVO)
                .domicilio("Calle Falsa 123")
                .build();

        usuarioGuardado = Usuario.builder()
                .idUsuario(10L)
                .dni("38123456")
                .nombreCompleto("Carlos Gomez")
                .email("carlos.gomez@example.com")
                .fechaNacimiento(fechaNac)
                .puntosAc(0)
                .estado(EstadoUsuario.ACTIVO)
                .domicilio("Calle Falsa 123")
                .rol(rol)
                .categoria(categoria)
                .passwordHash("encodedPasswordHash")
                .build();

        usuarioResponseDto = new UsuarioResponseDto(
                10L,
                "38123456",
                "Carlos Gomez",
                "carlos.gomez@example.com",
                fechaNac,
                0,
                EstadoUsuario.ACTIVO,
                "Calle Falsa 123",
                rol,
                categoria
        );
    }

    // ==========================================
    // PRUEBAS DE CREACIÓN DE USUARIOS
    // ==========================================

    @Test
    @DisplayName("Debe crear un usuario exitosamente cuando todos los datos son válidos")
    void crear_Success_WhenDataIsValid() {
        // Arrange
        when(usuarioRepository.existsByEmail("carlos.gomez@example.com")).thenReturn(false);
        when(usuarioMapper.toEntity(usuarioRequestDto)).thenReturn(usuarioEntity);
        when(rolRepository.findById(1)).thenReturn(Optional.of(rol));
        when(categoriaRepository.findById(2)).thenReturn(Optional.of(categoria));
        when(passwordEncoder.encode("passwordSegura123")).thenReturn("encodedPasswordHash");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioGuardado);
        when(usuarioMapper.toResponseDto(usuarioGuardado)).thenReturn(usuarioResponseDto);

        // Act
        UsuarioResponseDto resultado = usuarioService.crear(usuarioRequestDto);

        // Assert
        assertNotNull(resultado);
        assertEquals(10L, resultado.id());
        assertEquals("38123456", resultado.dni());
        assertEquals("carlos.gomez@example.com", resultado.email());
        assertEquals("RECEPCIONISTA", resultado.rol().getNombreRol());

        verify(usuarioRepository, times(1)).existsByEmail("carlos.gomez@example.com");
        verify(rolRepository, times(1)).findById(1);
        verify(categoriaRepository, times(1)).findById(2);
        verify(passwordEncoder, times(1)).encode("passwordSegura123");
        verify(usuarioRepository, times(1)).save(usuarioEntity);
        verify(usuarioMapper, times(1)).toResponseDto(usuarioGuardado);
    }

    @Test
    @DisplayName("Debe lanzar IllegalArgumentException al crear usuario si el email ya existe")
    void crear_ThrowsException_WhenEmailAlreadyExists() {
        // Arrange
        when(usuarioRepository.existsByEmail("carlos.gomez@example.com")).thenReturn(true);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                usuarioService.crear(usuarioRequestDto)
        );

        assertTrue(exception.getMessage().contains("Ya existe un usuario con el email: carlos.gomez@example.com"));
        verify(usuarioRepository, times(1)).existsByEmail("carlos.gomez@example.com");
        verifyNoInteractions(rolRepository);
        verifyNoInteractions(categoriaRepository);
        verifyNoInteractions(passwordEncoder);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar IllegalArgumentException al crear usuario si el DNI es inválido")
    void crear_ThrowsException_WhenDniIsInvalid() {
        // Arrange: DNI que comienza con 0 o tiene letras / longitud incorrecta
        UsuarioRequestDto dtoDniInvalido = new UsuarioRequestDto(
                "01234567",
                "Carlos Gomez",
                "carlos.gomez@example.com",
                LocalDateTime.of(1995, 5, 20, 0, 0),
                EstadoUsuario.ACTIVO,
                "Calle Falsa 123",
                "passwordSegura123",
                1,
                2
        );

        when(usuarioRepository.existsByEmail("carlos.gomez@example.com")).thenReturn(false);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                usuarioService.crear(dtoDniInvalido)
        );

        assertEquals("El DNI ingresado no tiene un formato válido", exception.getMessage());
        verify(usuarioRepository, times(1)).existsByEmail("carlos.gomez@example.com");
        verifyNoInteractions(rolRepository);
        verifyNoInteractions(categoriaRepository);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar IllegalArgumentException al crear usuario si el rol no existe")
    void crear_ThrowsException_WhenRolNotFound() {
        // Arrange
        when(usuarioRepository.existsByEmail("carlos.gomez@example.com")).thenReturn(false);
        when(usuarioMapper.toEntity(usuarioRequestDto)).thenReturn(usuarioEntity);
        when(rolRepository.findById(1)).thenReturn(Optional.empty());

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                usuarioService.crear(usuarioRequestDto)
        );

        assertEquals("Rol no encontrado", exception.getMessage());
        verify(rolRepository, times(1)).findById(1);
        verifyNoInteractions(categoriaRepository);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar IllegalArgumentException al crear usuario si la categoría no existe")
    void crear_ThrowsException_WhenCategoriaNotFound() {
        // Arrange
        when(usuarioRepository.existsByEmail("carlos.gomez@example.com")).thenReturn(false);
        when(usuarioMapper.toEntity(usuarioRequestDto)).thenReturn(usuarioEntity);
        when(rolRepository.findById(1)).thenReturn(Optional.of(rol));
        when(categoriaRepository.findById(2)).thenReturn(Optional.empty());

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                usuarioService.crear(usuarioRequestDto)
        );

        assertEquals("Categoría no encontrada", exception.getMessage());
        verify(rolRepository, times(1)).findById(1);
        verify(categoriaRepository, times(1)).findById(2);
        verify(usuarioRepository, never()).save(any());
    }
}
