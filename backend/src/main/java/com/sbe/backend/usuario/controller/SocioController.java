package com.sbe.backend.usuario.controller;

import com.sbe.backend.usuario.dto.AjustePuntosRequestDto;
import com.sbe.backend.usuario.dto.AsignarCategoriaRequestDto;
import com.sbe.backend.usuario.dto.SocioResponseDto;
import com.sbe.backend.usuario.service.SocioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/socios")
@RequiredArgsConstructor
public class SocioController {

    private final SocioService socioService;

    /**
     * Listar todos los socios activos del polideportivo.
     */
    @GetMapping
    public ResponseEntity<List<SocioResponseDto>> listarSociosActivos() {
        return ResponseEntity.ok(socioService.listarSociosActivos());
    }

    /**
     * Consultar el estado y carnet de socio por DNI.
     */
    @GetMapping("/{dni}")
    public ResponseEntity<SocioResponseDto> buscarPorDni(@PathVariable String dni) {
        return ResponseEntity.ok(socioService.buscarSocioPorDni(dni));
    }

    /**
     * Asignar o cambiar categoría a un socio (CU-02.1 / CU-02.2).
     */
    @PutMapping("/{dni}/categoria")
    public ResponseEntity<SocioResponseDto> asignarCategoria(
            @PathVariable String dni,
            @Valid @RequestBody AsignarCategoriaRequestDto dto) {
        return ResponseEntity.ok(socioService.asignarCategoria(dni, dto));
    }

    /**
     * Quitar membresía de socio y volver a dejarlo como NO_SOCIO (CU-02.3).
     */
    @PutMapping("/{dni}/baja-membresia")
    public ResponseEntity<SocioResponseDto> darDeBajaMembresia(@PathVariable String dni) {
        return ResponseEntity.ok(socioService.darDeBajaMembresia(dni));
    }

    /**
     * Sumar puntos acumulados tras una actividad o pago (CU-02.6).
     */
    @PostMapping("/{dni}/puntos/sumar")
    public ResponseEntity<SocioResponseDto> sumarPuntos(
            @PathVariable String dni,
            @Valid @RequestBody AjustePuntosRequestDto dto) {
        return ResponseEntity.ok(socioService.sumarPuntos(dni, dto));
    }

    /**
     * Canjear puntos acumulados (CU-02.6).
     */
    @PostMapping("/{dni}/puntos/canjear")
    public ResponseEntity<SocioResponseDto> canjearPuntos(
            @PathVariable String dni,
            @Valid @RequestBody AjustePuntosRequestDto dto) {
        return ResponseEntity.ok(socioService.canjearPuntos(dni, dto));
    }
}