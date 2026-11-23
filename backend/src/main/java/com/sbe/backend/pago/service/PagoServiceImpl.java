package com.sbe.backend.pago.service;

import com.sbe.backend.pago.dto.PagoRequestDto;
import com.sbe.backend.pago.dto.PagoResponseDto;
import com.sbe.backend.pago.entity.EstadoPago;
import com.sbe.backend.pago.entity.Pago;
import com.sbe.backend.pago.entity.TipoPago;
import com.sbe.backend.pago.mapper.PagoMapper;
import com.sbe.backend.pago.repository.PagoRepository;
import com.sbe.backend.reserva.entity.Reserva;
import com.sbe.backend.reserva.repository.ReservaRepository;
import com.sbe.backend.usuario.entity.Usuario;
import com.sbe.backend.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PagoServiceImpl implements PagoService {

    private final PagoRepository pagoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ReservaRepository reservaRepository;
    private final PagoMapper pagoMapper;

    @Override
    @Transactional
    public PagoResponseDto crearPago(PagoRequestDto dto, Authentication authentication) {
        Usuario usuario = usuarioRepository.findById(dto.idUsuario())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado con ID: " + dto.idUsuario()));

        Pago pago = pagoMapper.toEntity(dto);
        pago.setUsuario(usuario);

        int puntosUsados = dto.puntosUsados() != null ? dto.puntosUsados() : 0;
        if (puntosUsados < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los puntos usados no pueden ser negativos");
        }
        if (puntosUsados > 0 && (usuario.getPuntosAc() == null || usuario.getPuntosAc() < puntosUsados)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No tienes suficientes puntos para este pago");
        }

        // Validaciones según el tipo de pago
        if (dto.tipoPago() == TipoPago.RESERVA) {
            if (dto.idReserva() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Para pagos de tipo RESERVA, el ID de la reserva es obligatorio");
            }

            Reserva reserva = reservaRepository.findById(dto.idReserva())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada con ID: " + dto.idReserva()));

            if (!reserva.getUsuario().getIdUsuario().equals(usuario.getIdUsuario())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La reserva no pertenece al usuario especificado");
            }

            pago.setReserva(reserva);
            pago.setPeriodo(null);

            java.math.BigDecimal descuentoPuntos = java.math.BigDecimal.valueOf(puntosUsados);
            java.math.BigDecimal montoEsperado = reserva.getMonto().subtract(descuentoPuntos);
            if (montoEsperado.signum() < 0 || dto.montoPago().compareTo(montoEsperado) != 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El monto del pago no coincide con los puntos aplicados");
            }
            pago.setPuntosUsados(puntosUsados);
        } else if (dto.tipoPago() == TipoPago.CUOTA_MEMBRESIA) {
            if (dto.montoPago().add(java.math.BigDecimal.valueOf(puntosUsados)).signum() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El monto del pago debe ser mayor a 0");
            }
            if (dto.periodo() == null || dto.periodo().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Para pagos de CUOTA_MEMBRESIA, el periodo es obligatorio (ej. 2026-11)");
            }
            pago.setReserva(null);
            pago.setPeriodo(dto.periodo().trim());
            pago.setPuntosUsados(puntosUsados);
        }

        if (puntosUsados > 0) {
            usuario.setPuntosAc(usuario.getPuntosAc() - puntosUsados);
            usuarioRepository.save(usuario);
        }

        // Asignar registrado_por si hay usuario autenticado
        if (authentication != null && authentication.getName() != null) {
            usuarioRepository.findByDni(authentication.getName())
                    .ifPresent(pago::setRegistradoPor);
        }

        Pago guardado = pagoRepository.save(pago);
        return pagoMapper.toResponseDto(guardado);
    }

    @Override
    @Transactional
    public PagoResponseDto aprobarPago(Long idPago, Authentication authentication) {
        Pago pago = findOrThrow(idPago);

        if (pago.getEstadoPago() == EstadoPago.APROBADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El pago ya se encuentra aprobado");
        }

        if (pago.getEstadoPago() == EstadoPago.ANULADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede aprobar un pago que ha sido anulado");
        }

        pago.setEstadoPago(EstadoPago.APROBADO);
        pago.setFechaPago(LocalDateTime.now());

        if (authentication != null && authentication.getName() != null) {
            usuarioRepository.findByDni(authentication.getName())
                    .ifPresent(pago::setRegistradoPor);
        }

        Pago actualizado = pagoRepository.save(pago);
        return pagoMapper.toResponseDto(actualizado);
    }

    @Override
    @Transactional
    public PagoResponseDto rechazarPago(Long idPago) {
        Pago pago = findOrThrow(idPago);

        if (pago.getEstadoPago() == EstadoPago.APROBADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede rechazar un pago previamente aprobado");
        }

        pago.setEstadoPago(EstadoPago.RECHAZADO);
        Pago actualizado = pagoRepository.save(pago);
        return pagoMapper.toResponseDto(actualizado);
    }

    @Override
    @Transactional
    public PagoResponseDto anularPago(Long idPago) {
        Pago pago = findOrThrow(idPago);
        pago.setEstadoPago(EstadoPago.ANULADO);
        Pago actualizado = pagoRepository.save(pago);
        return pagoMapper.toResponseDto(actualizado);
    }

    @Override
    @Transactional
    public PagoResponseDto cambiarEstadoPago(Long idPago, EstadoPago nuevoEstado, Authentication authentication) {
        if (nuevoEstado == EstadoPago.APROBADO) {
            return aprobarPago(idPago, authentication);
        } else if (nuevoEstado == EstadoPago.RECHAZADO) {
            return rechazarPago(idPago);
        } else if (nuevoEstado == EstadoPago.ANULADO) {
            return anularPago(idPago);
        }

        Pago pago = findOrThrow(idPago);
        pago.setEstadoPago(nuevoEstado);
        Pago actualizado = pagoRepository.save(pago);
        return pagoMapper.toResponseDto(actualizado);
    }

    @Override
    @Transactional(readOnly = true)
    public PagoResponseDto buscarPorId(Long idPago) {
        Pago pago = findOrThrow(idPago);
        return pagoMapper.toResponseDto(pago);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PagoResponseDto> listarTodos(Long idUsuario, EstadoPago estadoPago, TipoPago tipoPago, Pageable pageable) {
        return pagoRepository.listarConFiltros(idUsuario, estadoPago, tipoPago, pageable)
                .map(pagoMapper::toResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PagoResponseDto> listarHistorialUsuario(Long idUsuario) {
        usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        return pagoRepository.findByUsuarioIdUsuario(idUsuario)
                .stream()
                .map(pagoMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PagoResponseDto> listarMisPagos(Authentication authentication) {
        String dni = authentication.getName();
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        return pagoRepository.findByUsuarioIdUsuario(usuario.getIdUsuario())
                .stream()
                .map(pagoMapper::toResponseDto)
                .toList();
    }

    private Pago findOrThrow(Long idPago) {
        return pagoRepository.findById(idPago)
                .orElseThrow(() -> new NoSuchElementException("Pago no encontrado con ID: " + idPago));
    }
}
