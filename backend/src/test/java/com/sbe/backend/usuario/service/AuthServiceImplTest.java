package com.sbe.backend.usuario.service;

import com.sbe.backend.security.JwtUtils;
import com.sbe.backend.usuario.dto.LoginRequestDto;
import com.sbe.backend.usuario.dto.LoginResponseDto;
import com.sbe.backend.usuario.entity.Rol;
import com.sbe.backend.usuario.entity.Usuario;
import com.sbe.backend.usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthServiceImpl authService;

    private LoginRequestDto loginRequestDto;
    private Usuario usuario;
    private Rol rolAdmin;

    @BeforeEach
    void setUp() {
        loginRequestDto = new LoginRequestDto("12345678", "password123");

        rolAdmin = Rol.builder()
                .idRol(1)
                .nombreRol("ADMINISTRADOR")
                .desc("Administrador del sistema")
                .build();

        usuario = Usuario.builder()
                .idUsuario(1L)
                .dni("12345678")
                .nombreCompleto("Juan Perez")
                .email("juan.perez@example.com")
                .passwordHash("hashedPassword")
                .estado(Usuario.EstadoUsuario.ACTIVO)
                .rol(rolAdmin)
                .build();
    }

    @Test
    @DisplayName("Debe autenticar correctamente y retornar token JWT cuando las credenciales y rol son válidos")
    void login_Success_WhenValidCredentialsAndRole() {
        // Arrange
        when(usuarioRepository.findByDni("12345678")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);
        when(jwtUtils.generateToken("12345678", "ADMINISTRADOR")).thenReturn("mocked.jwt.token");

        // Act
        LoginResponseDto response = authService.login(loginRequestDto);

        // Assert
        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.token());
        verify(usuarioRepository, times(1)).findByDni("12345678");
        verify(passwordEncoder, times(1)).matches("password123", "hashedPassword");
        verify(jwtUtils, times(1)).generateToken("12345678", "ADMINISTRADOR");
    }

    @Test
    @DisplayName("Debe lanzar ResponseStatusException 401 UNAUTHORIZED cuando el usuario no existe")
    void login_ThrowsUnauthorized_WhenUserNotFound() {
        // Arrange
        when(usuarioRepository.findByDni("12345678")).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                authService.login(loginRequestDto)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        assertEquals("Credenciales incorrectas", exception.getReason());
        verify(usuarioRepository, times(1)).findByDni("12345678");
        verifyNoInteractions(passwordEncoder);
        verifyNoInteractions(jwtUtils);
    }

    @Test
    @DisplayName("Debe lanzar ResponseStatusException 401 UNAUTHORIZED cuando la contraseña es incorrecta")
    void login_ThrowsUnauthorized_WhenPasswordDoesNotMatch() {
        // Arrange
        when(usuarioRepository.findByDni("12345678")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                authService.login(loginRequestDto)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        assertEquals("Credenciales incorrectas", exception.getReason());
        verify(usuarioRepository, times(1)).findByDni("12345678");
        verify(passwordEncoder, times(1)).matches("password123", "hashedPassword");
        verifyNoInteractions(jwtUtils);
    }

    @Test
    @DisplayName("Debe lanzar ResponseStatusException 403 FORBIDDEN cuando el usuario está dado de baja")
    void login_ThrowsForbidden_WhenUserIsDeBaja() {
        // Arrange
        usuario.setEstado(Usuario.EstadoUsuario.DE_BAJA);
        when(usuarioRepository.findByDni("12345678")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                authService.login(loginRequestDto)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertEquals("La cuenta se encuentra dada de baja.", exception.getReason());
        verify(usuarioRepository, times(1)).findByDni("12345678");
        verify(passwordEncoder, times(1)).matches("password123", "hashedPassword");
        verifyNoInteractions(jwtUtils);
    }

    @Test
    @DisplayName("Debe lanzar ResponseStatusException 403 FORBIDDEN cuando el rol del usuario es null")
    void login_ThrowsForbidden_WhenRolIsNull() {
        // Arrange
        usuario.setRol(null);
        when(usuarioRepository.findByDni("12345678")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                authService.login(loginRequestDto)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertEquals("Usuario sin rol asignado.", exception.getReason());
        verify(usuarioRepository, times(1)).findByDni("12345678");
        verify(passwordEncoder, times(1)).matches("password123", "hashedPassword");
        verifyNoInteractions(jwtUtils);
    }

    @Test
    @DisplayName("Debe lanzar ResponseStatusException 403 FORBIDDEN cuando el nombre del rol es null")
    void login_ThrowsForbidden_WhenRolNombreIsNull() {
        // Arrange
        Rol rolSinNombre = Rol.builder().idRol(2).nombreRol(null).build();
        usuario.setRol(rolSinNombre);
        when(usuarioRepository.findByDni("12345678")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                authService.login(loginRequestDto)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertEquals("Usuario sin rol asignado.", exception.getReason());
        verify(usuarioRepository, times(1)).findByDni("12345678");
        verify(passwordEncoder, times(1)).matches("password123", "hashedPassword");
        verifyNoInteractions(jwtUtils);
    }

    @Test
    @DisplayName("Debe lanzar ResponseStatusException 403 FORBIDDEN cuando el rol es SOCIO")
    void login_ThrowsForbidden_WhenRolIsSocio() {
        // Arrange
        Rol rolSocio = Rol.builder().idRol(3).nombreRol("SOCIO").build();
        usuario.setRol(rolSocio);
        when(usuarioRepository.findByDni("12345678")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                authService.login(loginRequestDto)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertEquals("Acceso denegado: Los socios no tienen autorización para ingresar al panel de administración.", exception.getReason());
        verify(usuarioRepository, times(1)).findByDni("12345678");
        verify(passwordEncoder, times(1)).matches("password123", "hashedPassword");
        verifyNoInteractions(jwtUtils);
    }

    @Test
    @DisplayName("Debe lanzar ResponseStatusException 403 FORBIDDEN cuando el rol es CLIENTE")
    void login_ThrowsForbidden_WhenRolIsCliente() {
        // Arrange
        Rol rolCliente = Rol.builder().idRol(4).nombreRol(" cliente ").build();
        usuario.setRol(rolCliente);
        when(usuarioRepository.findByDni("12345678")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                authService.login(loginRequestDto)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertEquals("Acceso denegado: Los socios no tienen autorización para ingresar al panel de administración.", exception.getReason());
        verify(usuarioRepository, times(1)).findByDni("12345678");
        verify(passwordEncoder, times(1)).matches("password123", "hashedPassword");
        verifyNoInteractions(jwtUtils);
    }
}
