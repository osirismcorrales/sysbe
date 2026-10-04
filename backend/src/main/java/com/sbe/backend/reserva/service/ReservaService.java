package com.sbe.backend.reserva.service;

import com.sbe.backend.reserva.dto.ReprogramarReservaRequestDto;
import com.sbe.backend.reserva.dto.ReservaHistorialResponseDto;
import com.sbe.backend.reserva.dto.ReservaRequestDto;
import com.sbe.backend.reserva.dto.ReservaResponseDto;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface ReservaService {

    ReservaResponseDto crearReserva(ReservaRequestDto dto);

    ReservaResponseDto cancelarReserva(Long idReserva);

    ReservaResponseDto reprogramarReserva(Long idReserva, ReprogramarReservaRequestDto dto);

    List<ReservaResponseDto> obtenerHistorialUsuario(Long idUsuario);

    List<ReservaHistorialResponseDto> obtenerMisReservas(Authentication authentication);
}
