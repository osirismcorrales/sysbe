package com.sbe.backend.usuario.controller;

import com.sbe.backend.usuario.dto.UsuarioRequestDto;
import com.sbe.backend.usuario.dto.UsuarioResponseDto;
import com.sbe.backend.usuario.dto.UsuarioUpdateDto;
import com.sbe.backend.usuario.service.UsuarioService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Tag(name = "usuarios", description = "CRUD de usuarios del sistema")

public class UsuarioController {
    private final UsuarioService usuarioService;

    // GET http://localhost:8080/api/usuarios
    @GetMapping
    public ResponseEntity<List<UsuarioResponseDto>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    // GET http://localhost:8080/api/usuarios/{id}
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    // POST http://localhost:8080/api/usuarios
    @PostMapping
    public ResponseEntity<UsuarioResponseDto> crear(@Valid @RequestBody UsuarioRequestDto dto) {
        UsuarioResponseDto nuevoUsuario = usuarioService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
    }

    // PUT http://localhost:8080/api/usuarios/{id}
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDto> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioUpdateDto dto) {
        return ResponseEntity.ok(usuarioService.actualizar(id, dto));
    }

    // DELETE http://localhost:8080/api/usuarios/{id} (baja lógica)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        usuarioService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
