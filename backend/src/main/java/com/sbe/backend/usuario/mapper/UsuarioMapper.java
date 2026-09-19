package com.sbe.backend.usuario.mapper;

import com.sbe.backend.usuario.dto.UsuarioRequestDto;
import com.sbe.backend.usuario.dto.UsuarioResponseDto;
import com.sbe.backend.usuario.entity.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {


    public Usuario toEntity(UsuarioRequestDto dto) {
        return Usuario.builder()
                .dni(dto.dni())
                .nombreCompleto(dto.nombreCompleto())
                .email(dto.email())
                .fechaNacimiento(dto.fechaNacimiento())
                .puntosAc(dto.puntosAc())
                .estado(dto.estado())
                .domicilio(dto.domicilio())
                .build();
    }

    public UsuarioResponseDto toResponseDto(Usuario usuario){
        return new UsuarioResponseDto(usuario.getIdUsuario(),
                usuario.getDni(),
                usuario.getNombreCompleto(),
                usuario.getEmail(),
                usuario.getFechaNacimiento(),
                usuario.getPuntosAc(),
                usuario.getEstado(),
                usuario.getDomicilio(),
                usuario.getRol(),
                usuario.getCategoria());
    }

}
