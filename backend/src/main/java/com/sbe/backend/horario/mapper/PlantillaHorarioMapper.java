package com.sbe.backend.horario.mapper;


import com.sbe.backend.horario.dto.PlantillaHorarioRequestDto;
import com.sbe.backend.horario.dto.PlantillaHorarioResponseDto;
import com.sbe.backend.horario.entity.PlantillaHorario;
import com.sbe.backend.instalacion.entity.Instalacion;
import org.springframework.stereotype.Component;

@Component
public class PlantillaHorarioMapper {

    public PlantillaHorario toEntity(PlantillaHorarioRequestDto dto, Instalacion instalacion) {
        return PlantillaHorario.builder()
                .instalacion(instalacion)
                .diaSemana(dto.diaSemana())
                .horaInicio(dto.horaInicio())
                .horaFin(dto.horaFin())
                .build();
    }

    public void updateEntity(PlantillaHorarioRequestDto dto, PlantillaHorario p, Instalacion instalacion) {
        p.setInstalacion(instalacion);
        p.setDiaSemana(dto.diaSemana());
        p.setHoraInicio(dto.horaInicio());
        p.setHoraFin(dto.horaFin());
    }


    public PlantillaHorarioResponseDto toResponseDto(PlantillaHorario p) {
        return new PlantillaHorarioResponseDto(
                p.getId(),
                p.getInstalacion().getId(),
                p.getInstalacion().getNombre(),
                p.getDiaSemana(),
                p.getHoraInicio(),
                p.getHoraFin());
    }
}