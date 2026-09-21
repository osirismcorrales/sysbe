package com.sbe.backend.horario.dto;

import com.sbe.backend.horario.entity.DiaSemana;

import java.time.LocalTime;

public record PlantillaHorarioResponseDto(
        Long id,
        Long idInstalacion,
        String nombreInstalacion,
        DiaSemana diaSemana,
        LocalTime horaInicio,
        LocalTime horaFin
) {}