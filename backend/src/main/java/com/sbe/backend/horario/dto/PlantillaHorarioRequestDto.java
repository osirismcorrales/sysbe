package com.sbe.backend.horario.dto;


import com.sbe.backend.horario.entity.DiaSemana;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record PlantillaHorarioRequestDto(
        @NotNull Long idInstalacion,
        @NotNull DiaSemana diaSemana,
        @NotNull LocalTime horaInicio,
        @NotNull LocalTime horaFin
) {}