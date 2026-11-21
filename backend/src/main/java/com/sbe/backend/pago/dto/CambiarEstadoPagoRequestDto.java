package com.sbe.backend.pago.dto;

import com.sbe.backend.pago.entity.EstadoPago;
import jakarta.validation.constraints.NotNull;

public record CambiarEstadoPagoRequestDto(

        @NotNull(message = "El nuevo estado del pago es obligatorio")
        EstadoPago estadoPago

) {
}
