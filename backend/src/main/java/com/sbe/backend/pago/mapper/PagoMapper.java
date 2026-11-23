package com.sbe.backend.pago.mapper;

import com.sbe.backend.pago.dto.PagoRequestDto;
import com.sbe.backend.pago.dto.PagoResponseDto;
import com.sbe.backend.pago.entity.EstadoPago;
import com.sbe.backend.pago.entity.Pago;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class PagoMapper {

    public Pago toEntity(PagoRequestDto dto) {
        return Pago.builder()
                .tipoPago(dto.tipoPago())
                .periodo(dto.periodo())
                .montoPago(dto.montoPago())
                .puntosUsados(dto.puntosUsados() != null ? dto.puntosUsados() : 0)
                .metodoPago(dto.metodoPago())
                .estadoPago(dto.estadoPago() != null ? dto.estadoPago() : EstadoPago.PENDIENTE)
                .fechaCreacion(LocalDateTime.now())
                .fechaPago(dto.estadoPago() == EstadoPago.APROBADO ? LocalDateTime.now() : null)
                .build();
    }

    public PagoResponseDto toResponseDto(Pago pago) {
        if (pago == null) {
            return null;
        }

        return new PagoResponseDto(
                pago.getIdPago(),
                pago.getUsuario() != null ? pago.getUsuario().getIdUsuario() : null,
                pago.getUsuario() != null ? pago.getUsuario().getDni() : null,
                pago.getUsuario() != null ? pago.getUsuario().getNombreCompleto() : null,
                pago.getUsuario() != null ? pago.getUsuario().getPuntosAc() : null,
                pago.getReserva() != null ? pago.getReserva().getIdReserva() : null,
                pago.getTipoPago(),
                pago.getPeriodo(),
                pago.getMontoPago(),
                pago.getPuntosUsados() != null ? pago.getPuntosUsados() : 0,
                pago.getMetodoPago(),
                pago.getEstadoPago(),
                pago.getFechaCreacion(),
                pago.getFechaPago(),
                pago.getRegistradoPor() != null ? pago.getRegistradoPor().getIdUsuario() : null,
                pago.getRegistradoPor() != null ? pago.getRegistradoPor().getNombreCompleto() : null
        );
    }
}
