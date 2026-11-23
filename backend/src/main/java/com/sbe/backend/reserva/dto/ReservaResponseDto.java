package com.sbe.backend.reserva.dto;

import com.sbe.backend.reserva.entity.EstadoReserva;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ReservaResponseDto(

        Long idReserva,
        LocalDate fechaReserva,
        LocalDateTime fechaCreacion,
        LocalTime horarioInicio,
        LocalTime horarioFin,
        EstadoReserva estadoReserva,
        BigDecimal montoReserva,
        Long idUsuario,
        Long idInstalacion

) {
}
