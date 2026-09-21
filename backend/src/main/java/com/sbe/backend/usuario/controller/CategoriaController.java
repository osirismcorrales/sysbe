package com.sbe.backend.usuario.controller;

import com.sbe.backend.usuario.dto.CategoriaResponseDto;
import com.sbe.backend.usuario.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public ResponseEntity<List<CategoriaResponseDto>> listarTodas() {
        return ResponseEntity.ok(categoriaService.listarTodas());
    }
}