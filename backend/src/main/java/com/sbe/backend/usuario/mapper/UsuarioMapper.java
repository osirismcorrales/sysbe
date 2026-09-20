package com.sbe.backend.usuario.mapper;

import com.sbe.backend.usuario.dto.SocioResponseDto;
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
                .puntosAc(0)
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

    public SocioResponseDto toSocioResponseDto(Usuario usuario) {
        if (usuario == null) {
            return null;
        }

        return new SocioResponseDto(
                usuario.getIdUsuario(),
                usuario.getDni(),
                usuario.getNombreCompleto(),
                usuario.getEmail(),
                usuario.getEstado() != null ? usuario.getEstado().name() : null,
                usuario.getPuntosAc(),
                usuario.getCategoria().getIdCategoria(),
                usuario.getCategoria().getTipoSocio(),
                usuario.getCategoria().getVinculoUnse(),
                usuario.getCategoria().getDescuento()
        );
    }

}
