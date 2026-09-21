package com.sbe.backend.reserva.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservaRequestDto(

        @NotNull
        LocalDate fechaReserva,

        @NotNull
        LocalTime horarioInicio,

        @NotNull
        LocalTime horarioFin,

        @NotNull
        Long idUsuario,

        @NotNull
        Long idInstalacion

        ) {
}
