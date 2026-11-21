package com.sbe.backend.pago.dto;

import com.sbe.backend.pago.entity.EstadoPago;
import com.sbe.backend.pago.entity.MetodoPago;
import com.sbe.backend.pago.entity.TipoPago;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PagoResponseDto(

        Long idPago,
        Long idUsuario,
        String dniUsuario,
        String nombreUsuario,
        Long idReserva,
        TipoPago tipoPago,
        String periodo,
        BigDecimal montoPago,
        MetodoPago metodoPago,
        EstadoPago estadoPago,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaPago,
        Long registradoPorId,
        String registradoPorNombre

) {
}
