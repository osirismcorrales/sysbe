package com.sbe.backend.reporte.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PagoReporteDto(
        Long idPago,
        String dniUsuario,
        String nombreUsuario,
        String tipoPago,
        String periodo,
        Long idReserva,
        BigDecimal montoPago,
        String metodoPago,
        String estadoPago,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaPago
) {
}
