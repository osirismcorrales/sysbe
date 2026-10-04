package com.sbe.backend.usuario.controller;

import com.sbe.backend.usuario.dto.UsuarioRequestDto;
import com.sbe.backend.usuario.dto.UsuarioResponseDto;
import com.sbe.backend.usuario.dto.UsuarioUpdateDto;
import com.sbe.backend.usuario.dto.UsuarioUpdateMeDto;
import com.sbe.backend.usuario.service.UsuarioService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import com.sbe.backend.usuario.entity.Usuario;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Tag(name = "usuarios", description = "CRUD de usuarios del sistema")

public class UsuarioController {
    private final UsuarioService usuarioService;

    // GET http://localhost:8080/api/usuarios
    @GetMapping
    public ResponseEntity<Page<UsuarioResponseDto>> listar(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) Long idRol,
            @RequestParam(required = false) String rol,
            @RequestParam(required = false) Usuario.EstadoUsuario estado,
            @PageableDefault(size = 10, sort = "idUsuario", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(usuarioService.listarConFiltros(busqueda, idRol, rol, estado, pageable));
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

    // GET http://localhost:8080/api/usuarios/me
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDto> obtenerPerfilPropio(
            Authentication authentication) {

        String dniActual = authentication.getName();

        return ResponseEntity.ok(
                usuarioService.buscarPorDni(dniActual)
        );
    }

    // PUT http://localhost:8080/api/usuarios/me
    @PutMapping("/me")
    public ResponseEntity<UsuarioResponseDto> actualizarPerfilPropio(
            Authentication authentication,
            @Valid @RequestBody UsuarioUpdateMeDto dto) {

        // Obtenemos el identificador del usuario actualmente autenticado
        String dniActual = authentication.getName();

        UsuarioResponseDto usuarioActualizado = usuarioService.actualizarPerfilPropio(dniActual, dto);
        return ResponseEntity.ok(usuarioActualizado);
    }

    // DELETE http://localhost:8080/api/usuarios/{id} (baja lógica)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        usuarioService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
