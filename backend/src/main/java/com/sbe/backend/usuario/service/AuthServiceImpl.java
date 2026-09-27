package com.sbe.backend.usuario.service;

import com.sbe.backend.security.JwtUtils;
import com.sbe.backend.usuario.dto.LoginRequestDto;
import com.sbe.backend.usuario.dto.LoginResponseDto;
import com.sbe.backend.usuario.entity.Usuario;
import com.sbe.backend.usuario.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public LoginResponseDto login(LoginRequestDto request) {

        // 1. Busca usuario por DNI
        Usuario usuario = usuarioRepository.findByDni(request.dni())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas"));

        // 2. Comprueba la contraseña con BCrypt
        if (!passwordEncoder.matches(request.password(), usuario.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas");
        }

        // 3. Comprueba que el usuario no esté dado de baja
        if (usuario.getEstado() == Usuario.EstadoUsuario.DE_BAJA) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La cuenta se encuentra dada de baja.");
        }

        // 4. Obtiene y valida el rol
        if (usuario.getRol() == null || usuario.getRol().getNombreRol() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario sin rol asignado.");
        }

        String rol = usuario.getRol().getNombreRol().toUpperCase().trim();

        // 5. RESTRICCIÓN CLAVE: Bloquear si es SOCIO / CLIENTE
        if ("SOCIO".equals(rol) || "CLIENTE".equals(rol)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acceso denegado: Los socios no tienen autorización para ingresar al panel de administración."
            );
        }

        // 6. Genera el JWT
        String token = jwtUtils.generateToken(usuario.getDni(), rol);

        // 7. Retorna el DTO
        return new LoginResponseDto(token);
    }
}