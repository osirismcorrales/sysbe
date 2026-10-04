package com.sbe.backend.reserva.controller;

import com.sbe.backend.reserva.dto.ReprogramarReservaRequestDto;
import com.sbe.backend.reserva.dto.ReservaHistorialResponseDto;
import com.sbe.backend.reserva.dto.ReservaRequestDto;
import com.sbe.backend.reserva.dto.ReservaResponseDto;
import com.sbe.backend.reserva.service.ReservaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    @GetMapping
    public ResponseEntity<Page<ReservaResponseDto>> listarTodas(
            @PageableDefault(size = 10, sort = "fechaReserva", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reservaService.listarTodas(pageable));
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<ReservaResponseDto>> obtenerHistorialUsuario(@PathVariable Long idUsuario) {
        List<ReservaResponseDto> historial = reservaService.obtenerHistorialUsuario(idUsuario);
        return ResponseEntity.ok(historial);
    }

    @GetMapping("/me")
    public ResponseEntity<List<ReservaHistorialResponseDto>> obtenerMisReservas(
            Authentication authentication) {

        return ResponseEntity.ok(
                reservaService.obtenerMisReservas(authentication)
        );
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
