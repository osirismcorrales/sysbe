package com.sbe.backend.horario.controller;

import com.sbe.backend.horario.dto.BloqueDto;
import com.sbe.backend.horario.dto.PlantillaHorarioRequestDto;
import com.sbe.backend.horario.dto.PlantillaHorarioResponseDto;
import com.sbe.backend.horario.service.DisponibilidadService;
import com.sbe.backend.horario.service.PlantillaHorarioService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/plantillas-horario")
@RequiredArgsConstructor
@Tag(name = "plantillas-horario")
public class PlantillaHorarioController {

    private final PlantillaHorarioService plantillaService;
    private final DisponibilidadService disponibilidadService;

    @GetMapping("/disponibilidad")
    public ResponseEntity<List<BloqueDto>> consultarDisponibilidad(
            @RequestParam Long idInstalacion,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(disponibilidadService.consultarDisponibilidad(idInstalacion, fecha));
    }

    @GetMapping("/instalacion/{id:\\d+}/disponibilidad")
    public ResponseEntity<List<BloqueDto>> disponibilidadPorId(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(disponibilidadService.consultarDisponibilidad(id, fecha));
    }

    @GetMapping
    public ResponseEntity<List<PlantillaHorarioResponseDto>> listar(
            @RequestParam(required = false) Long idInstalacion) {
        return ResponseEntity.ok(plantillaService.listar(idInstalacion));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<PlantillaHorarioResponseDto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(plantillaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<PlantillaHorarioResponseDto> crear(
            @Valid @RequestBody PlantillaHorarioRequestDto dto) {
        PlantillaHorarioResponseDto creada = plantillaService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<PlantillaHorarioResponseDto> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PlantillaHorarioRequestDto dto) {
        return ResponseEntity.ok(plantillaService.actualizar(id, dto));
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        plantillaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
