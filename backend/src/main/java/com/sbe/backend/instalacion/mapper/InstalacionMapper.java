package com.sbe.backend.instalacion.mapper;

import com.sbe.backend.instalacion.dto.InstalacionRequestDto;
import com.sbe.backend.instalacion.dto.InstalacionResponseDto;
import com.sbe.backend.instalacion.entity.Instalacion;
import org.springframework.stereotype.Component;

@Component
public class InstalacionMapper {


    public Instalacion toEntity (InstalacionRequestDto dto) {
        return Instalacion.builder().
                nombre(dto.nombre()).
                descripcion(dto.descripcion()).
                estado(dto.estado()).
                precioBase(dto.precioBase()).
                duracionMinutos(dto.duracionMinutos()).
                build();
    }


    public InstalacionResponseDto toResponseDto (Instalacion instalacion) {
        return new InstalacionResponseDto(
                instalacion.getId(),
                instalacion.getNombre(),
                instalacion.getDescripcion(),
                instalacion.getEstado(),
                instalacion.getPrecioBase(),
                instalacion.getDuracionMinutos()
        );
    }
}
