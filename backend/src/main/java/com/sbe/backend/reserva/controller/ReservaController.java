package com.sbe.backend.reserva.controller;

import com.sbe.backend.reserva.dto.ReprogramarReservaRequestDto;
import com.sbe.backend.reserva.dto.ReservaRequestDto;
import com.sbe.backend.reserva.dto.ReservaResponseDto;
import com.sbe.backend.reserva.service.ReservaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<ReservaResponseDto>> obtenerHistorialUsuario(@PathVariable Long idUsuario) {
        List<ReservaResponseDto> historial = reservaService.obtenerHistorialUsuario(idUsuario);
        return ResponseEntity.ok(historial);
    }

    @PostMapping
    public ResponseEntity<ReservaResponseDto> crearReserva(@Valid @RequestBody ReservaRequestDto reservaRequestDto){
        ReservaResponseDto creado = reservaService.crearReserva(reservaRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{idReserva}/cancelar")
    public ResponseEntity<ReservaResponseDto> cancelarReserva(@PathVariable Long idReserva) {
        ReservaResponseDto cancelada = reservaService.cancelarReserva(idReserva);
        return ResponseEntity.ok(cancelada);
    }

    @PutMapping("/{idReserva}/reprogramar")
    public ResponseEntity<ReservaResponseDto> reprogramarReserva(@PathVariable Long idReserva, @Valid @RequestBody ReprogramarReservaRequestDto dto) {
        ReservaResponseDto reprogramada = reservaService.reprogramarReserva(idReserva, dto);
        return ResponseEntity.ok(reprogramada);
    }

}
