package com.sbe.backend.pago.controller;

import com.sbe.backend.pago.dto.CambiarEstadoPagoRequestDto;
import com.sbe.backend.pago.dto.PagoRequestDto;
import com.sbe.backend.pago.dto.PagoResponseDto;
import com.sbe.backend.pago.entity.EstadoPago;
import com.sbe.backend.pago.entity.TipoPago;
import com.sbe.backend.pago.service.PagoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoService pagoService;

    @PostMapping
    public ResponseEntity<PagoResponseDto> crearPago(
            @Valid @RequestBody PagoRequestDto dto,
            Authentication authentication) {
        PagoResponseDto creado = pagoService.crearPago(dto, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @GetMapping
    public ResponseEntity<Page<PagoResponseDto>> listarTodos(
            @RequestParam(required = false) Long idUsuario,
            @RequestParam(required = false) EstadoPago estadoPago,
            @RequestParam(required = false) TipoPago tipoPago,
            @PageableDefault(size = 10, sort = "fechaCreacion", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(pagoService.listarTodos(idUsuario, estadoPago, tipoPago, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagoResponseDto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.buscarPorId(id));
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<PagoResponseDto>> listarHistorialUsuario(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(pagoService.listarHistorialUsuario(idUsuario));
    }

    @GetMapping("/me")
    public ResponseEntity<List<PagoResponseDto>> listarMisPagos(Authentication authentication) {
        return ResponseEntity.ok(pagoService.listarMisPagos(authentication));
    }

    @PutMapping("/{id}/aprobar")
    public ResponseEntity<PagoResponseDto> aprobarPago(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(pagoService.aprobarPago(id, authentication));
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<PagoResponseDto> rechazarPago(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.rechazarPago(id));
    }

    @PutMapping("/{id}/anular")
    public ResponseEntity<PagoResponseDto> anularPago(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.anularPago(id));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<PagoResponseDto> cambiarEstadoPago(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoPagoRequestDto dto,
            Authentication authentication) {
        return ResponseEntity.ok(pagoService.cambiarEstadoPago(id, dto.estadoPago(), authentication));
    }
}
