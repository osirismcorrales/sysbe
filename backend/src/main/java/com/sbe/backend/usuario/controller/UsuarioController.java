package com.sbe.backend.usuario.controller;

import com.sbe.backend.usuario.dto.UsuarioRequestDto;
import com.sbe.backend.usuario.dto.UsuarioResponseDto;
import com.sbe.backend.usuario.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para el recurso Usuario.
 *
 * CONVENCIONES:
 *  - @RestController = @Controller + @ResponseBody (serializa a JSON automaticamente)
 *  - @RequestMapping define el prefijo de la URL para todos los endpoints del controller
 *  - Seguir convenciones REST:
 *      GET    /api/usuarios         → listar todos
 *      GET    /api/usuarios/{id}    → obtener uno
 *      POST   /api/usuarios         → crear
 *      PUT    /api/usuarios/{id}    → actualizar completo
 *      DELETE /api/usuarios/{id}    → eliminar / desactivar
 *  - @Valid en parametros de request activa la validacion de Bean Validation
 *  - El Controller NO tiene logica de negocio → delega todo al Service
 *  - Usar ResponseEntity para tener control del status HTTP de la respuesta
 *
 * Swagger:
 *  - @Tag agrupa los endpoints en la UI de Swagger
 *  - @Operation describe cada endpoint
 */
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "CRUD de usuarios del sistema")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    @Operation(summary = "Listar todos los usuarios activos")
    public ResponseEntity<List<UsuarioResponseDto>> listar() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un usuario por ID")
    public ResponseEntity<UsuarioResponseDto> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo usuario")
    public ResponseEntity<UsuarioResponseDto> crear(@Valid @RequestBody UsuarioRequestDto dto) {
        UsuarioResponseDto creado = usuarioService.crear(dto);
        // 201 Created con el recurso creado en el cuerpo
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un usuario existente")
    public ResponseEntity<UsuarioResponseDto> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioRequestDto dto) {
        return ResponseEntity.ok(usuarioService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar un usuario (baja logica)")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        usuarioService.desactivar(id);
        // 204 No Content: operacion exitosa sin cuerpo de respuesta
        return ResponseEntity.noContent().build();
    }
}
