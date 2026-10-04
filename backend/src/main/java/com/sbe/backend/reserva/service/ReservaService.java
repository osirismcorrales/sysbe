package com.sbe.backend.reserva.service;

import com.sbe.backend.reserva.dto.ReprogramarReservaRequestDto;
import com.sbe.backend.reserva.dto.ReservaHistorialResponseDto;
import com.sbe.backend.reserva.dto.ReservaRequestDto;
import com.sbe.backend.reserva.dto.ReservaResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface ReservaService {

    Page<ReservaResponseDto> listarTodas(Pageable pageable);

    List<ReservaResponseDto> listarTodas();

    ReservaResponseDto crearReserva(ReservaRequestDto dto);

    ReservaResponseDto cancelarReserva(Long idReserva);

    ReservaResponseDto reprogramarReserva(Long idReserva, ReprogramarReservaRequestDto dto);

    List<ReservaResponseDto> obtenerHistorialUsuario(Long idUsuario);

    List<ReservaHistorialResponseDto> obtenerMisReservas(Authentication authentication);
}
