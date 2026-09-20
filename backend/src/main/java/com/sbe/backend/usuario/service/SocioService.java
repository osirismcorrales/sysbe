package com.sbe.backend.usuario.service;

import com.sbe.backend.usuario.dto.AjustePuntosRequestDto;
import com.sbe.backend.usuario.dto.AsignarCategoriaRequestDto;
import com.sbe.backend.usuario.dto.SocioResponseDto;
import com.sbe.backend.usuario.entity.Categoria;
import com.sbe.backend.usuario.entity.Usuario;
import com.sbe.backend.usuario.entity.Usuario.EstadoUsuario;
import com.sbe.backend.usuario.repository.CategoriaRepository;
import com.sbe.backend.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class SocioService {

    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;

    /**
     * Regla CU-02.1 / CU-02.2: Asignar o cambiar membresía a un usuario por su DNI.
     */
    @Transactional
    public SocioResponseDto asignarCategoria(String dni, AsignarCategoriaRequestDto dto) {
        // 1. Buscar al usuario por DNI
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new NoSuchElementException("No existe un usuario con DNI: " + dni));

        // 2. Validar que la cuenta esté activa
        if (usuario.getEstado() == EstadoUsuario.DE_BAJA) {
            throw new IllegalStateException("No se puede asignar categoría a un usuario dado de baja.");
        }

        // 3. Buscar la categoría solicitada
        Categoria nuevaCategoria = categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new NoSuchElementException("Categoría no encontrada con ID: " + dto.categoriaId()));

        // 4. Modificar la categoría del usuario
        usuario.setCategoria(nuevaCategoria);

        // 5. Devolver el DTO de respuesta con los datos actualizados
        return mapToSocioResponse(usuario);
    }

    /**
     * Regla CU-02.3: Dar de baja la membresía de socio.
     * No se borra al usuario ni se le da de baja a la cuenta; solo vuelve a ser NO_SOCIO.
     */
    @Transactional
    public SocioResponseDto darDeBajaMembresia(String dni) {
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new NoSuchElementException("No existe un usuario con DNI: " + dni));

        // Buscamos la categoría NO_SOCIO usando el método que agregamos en CategoriaRepository
        Categoria categoriaNoSocio = categoriaRepository.findByTipoSocio("NO_SOCIO")
                .orElseThrow(() -> new IllegalStateException("Categoría base 'NO_SOCIO' no configurada en el sistema."));

        usuario.setCategoria(categoriaNoSocio);

        return mapToSocioResponse(usuario);
    }

    /**
     * Regla CU-02.6: Sumar puntos tras una reserva o pago.
     */
    @Transactional
    public SocioResponseDto sumarPuntos(String dni, AjustePuntosRequestDto dto) {
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new NoSuchElementException("No existe un usuario con DNI: " + dni));

        usuario.setPuntosAc(usuario.getPuntosAc() + dto.puntos());

        return mapToSocioResponse(usuario);
    }

    /**
     * Regla CU-02.6: Canjear puntos.
     * Valida que el socio tenga saldo suficiente antes de restar.
     */
    @Transactional
    public SocioResponseDto canjearPuntos(String dni, AjustePuntosRequestDto dto) {
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new NoSuchElementException("No existe un usuario con DNI: " + dni));

        if (usuario.getPuntosAc() < dto.puntos()) {
            throw new IllegalArgumentException(
                    "Puntos insuficientes. El socio tiene " + usuario.getPuntosAc() +
                            " puntos y necesita " + dto.puntos()
            );
        }

        usuario.setPuntosAc(usuario.getPuntosAc() - dto.puntos());

        return mapToSocioResponse(usuario);
    }

    /**
     * Consulta del carnet de socio por DNI.
     */
    @Transactional(readOnly = true)
    public SocioResponseDto buscarSocioPorDni(String dni) {
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new NoSuchElementException("Socio no encontrado con DNI: " + dni));

        return mapToSocioResponse(usuario);
    }

    /**
     * Listar todos los socios activos (excluyendo a los NO_SOCIO).
     */
    @Transactional(readOnly = true)
    public List<SocioResponseDto> listarSociosActivos() {
        return usuarioRepository.listarSoloSocios()
                .stream()
                .map(this::mapToSocioResponse)
                .toList();
    }

    /**
     * Conversión privada y limpia de Usuario a SocioResponseDto sin exponer entidades.
     */
    private SocioResponseDto mapToSocioResponse(Usuario u) {
        return new SocioResponseDto(
                u.getIdUsuario(),
                u.getDni(),
                u.getNombreCompleto(),
                u.getEmail(),
                u.getEstado().name(),
                u.getPuntosAc(),
                u.getCategoria().getIdCategoria(),
                u.getCategoria().getTipoSocio(),
                u.getCategoria().getVinculoUnse(),
                u.getCategoria().getDescuento()
        );
    }
}