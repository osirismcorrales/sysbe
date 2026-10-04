package com.sbe.backend.reserva.dto;

import com.sbe.backend.reserva.entity.EstadoReserva;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record ReservaHistorialResponseDto(
        Long idReserva,
        LocalDate fechaReserva,
        LocalTime horarioInicio,
        LocalTime horarioFin,
        EstadoReserva estadoReserva,
        BigDecimal montoReserva,
        Long idInstalacion,
        String nombreInstalacion
) {
}