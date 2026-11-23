package com.sbe.backend.pago.dto;

import com.sbe.backend.pago.entity.EstadoPago;
import com.sbe.backend.pago.entity.MetodoPago;
import com.sbe.backend.pago.entity.TipoPago;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record PagoRequestDto(

        @NotNull(message = "El ID del usuario es obligatorio")
        Long idUsuario,

        Long idReserva,

        @NotNull(message = "El tipo de pago es obligatorio")
        TipoPago tipoPago,

        String periodo,

        @NotNull(message = "El monto del pago es obligatorio")
        @PositiveOrZero(message = "El monto no puede ser negativo")
        BigDecimal montoPago,

        Integer puntosUsados,

        @NotNull(message = "El método de pago es obligatorio")
        MetodoPago metodoPago,

        EstadoPago estadoPago

) {
}
