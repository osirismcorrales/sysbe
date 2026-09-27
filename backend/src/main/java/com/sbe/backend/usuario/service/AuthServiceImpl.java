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
import java.util.NoSuchElementException;

@Service
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils){
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public LoginResponseDto login(LoginRequestDto request) {

        // Busca usuario por DNI
        Usuario usuario = usuarioRepository.findByDni(request.dni())
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

        // Si existe usuario, comprueba la contraseña con BCrypt
        if(!passwordEncoder.matches(request.password(), usuario.getPasswordHash())){
            throw new IllegalArgumentException("Contraseña incorrecta");
        }

        // Si la contraseña es correcta, se obtiene el rol del usuario
        String rol = usuario.getRol().getNombreRol();

        // Se genera el JWT (el token que luego se enviará al frontend)
        String token = jwtUtils.generateToken(usuario.getDni(), rol);

        // Se devuelve el token
        return new LoginResponseDto(token);
    }

}


