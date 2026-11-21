package com.sbe.backend.pago.service;

import com.sbe.backend.pago.dto.PagoRequestDto;
import com.sbe.backend.pago.dto.PagoResponseDto;
import com.sbe.backend.pago.entity.EstadoPago;
import com.sbe.backend.pago.entity.TipoPago;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface PagoService {

    PagoResponseDto crearPago(PagoRequestDto dto, Authentication authentication);

    PagoResponseDto aprobarPago(Long idPago, Authentication authentication);

    PagoResponseDto rechazarPago(Long idPago);

    PagoResponseDto anularPago(Long idPago);

    PagoResponseDto cambiarEstadoPago(Long idPago, EstadoPago nuevoEstado, Authentication authentication);

    PagoResponseDto buscarPorId(Long idPago);

    Page<PagoResponseDto> listarTodos(Long idUsuario, EstadoPago estadoPago, TipoPago tipoPago, Pageable pageable);

    List<PagoResponseDto> listarHistorialUsuario(Long idUsuario);

    List<PagoResponseDto> listarMisPagos(Authentication authentication);
}
