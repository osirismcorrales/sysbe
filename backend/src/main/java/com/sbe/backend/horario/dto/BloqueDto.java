package com.sbe.backend.horario.dto;

import java.time.LocalTime;

public record BloqueDto(LocalTime horaInicio, LocalTime horaFin, boolean disponible) {}