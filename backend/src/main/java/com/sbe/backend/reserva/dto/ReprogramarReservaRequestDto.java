package com.sbe.backend.reserva.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReprogramarReservaRequestDto(

        @NotNull
        LocalDate fechaReserva,

        @NotNull
        LocalTime horarioInicio,

        @NotNull
        LocalTime horarioFin

) {
}
