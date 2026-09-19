package com.sbe.backend.instalacion.controller;

import com.sbe.backend.instalacion.dto.InstalacionRequestDto;
import com.sbe.backend.instalacion.dto.InstalacionResponseDto;
import com.sbe.backend.instalacion.service.InstalacionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instalaciones")
@RequiredArgsConstructor
@Tag(name = "instalaciones")
public class InstalacionController {
    private final InstalacionService instalacionService;


    @GetMapping
    public ResponseEntity<List<InstalacionResponseDto>> getAllInstalaciones() {
        return ResponseEntity.ok(instalacionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstalacionResponseDto> getInstalacionById(@PathVariable Long id) {
        return ResponseEntity.ok(instalacionService.findById(id));
    }

    @PostMapping
    public ResponseEntity<InstalacionResponseDto> createInstalacion(@Valid @RequestBody InstalacionRequestDto instalacionRequestDto) {
        InstalacionResponseDto creado = instalacionService.create(instalacionRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InstalacionResponseDto> updateInstalacion(@PathVariable Long id, @Valid @RequestBody InstalacionRequestDto instalacionRequestDto) {
        return ResponseEntity.ok(instalacionService.update(id, instalacionRequestDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<InstalacionResponseDto> deleteInstalacionById(@PathVariable Long id) {
        instalacionService.delete(id);
        return ResponseEntity.noContent().build();
    }


}
