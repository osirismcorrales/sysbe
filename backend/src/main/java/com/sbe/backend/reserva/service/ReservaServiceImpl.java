package com.sbe.backend.reserva.service;

import com.sbe.backend.instalacion.entity.Instalacion;
import com.sbe.backend.instalacion.repository.InstalacionRepository;
import com.sbe.backend.reserva.dto.ReprogramarReservaRequestDto;
import com.sbe.backend.reserva.dto.ReservaRequestDto;
import com.sbe.backend.reserva.dto.ReservaResponseDto;
import com.sbe.backend.reserva.entity.EstadoReserva;
import com.sbe.backend.reserva.entity.Reserva;
import com.sbe.backend.reserva.mapper.ReservaMapper;
import com.sbe.backend.reserva.repository.ReservaRepository;
import com.sbe.backend.usuario.entity.Usuario;
import com.sbe.backend.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaServiceImpl implements ReservaService{

    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;
    private final InstalacionRepository instalacionRepository;
    private final ReservaMapper reservaMapper;

    @Override
    public ReservaResponseDto crearReserva(ReservaRequestDto dto) {

        // Buscar usuario
        Usuario usuario = usuarioRepository.findById(dto.idUsuario())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        // Buscar instalación
        Instalacion instalacion = instalacionRepository.findById(dto.idInstalacion())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Instalación no encontrada"));

        // Validar las 48 hr antes
        LocalDateTime fechaHoraReserva = LocalDateTime.of(dto.fechaReserva(), dto.horarioInicio());

        LocalDateTime ahora = LocalDateTime.now();

        if (fechaHoraReserva.isBefore(ahora.plusHours(48))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La reserva debe realizarse con al menos 48 horas de anticipación");
        }


        // Validar máximo de 2 meses
        LocalDate fechaMaxima = LocalDate.now().plusMonths(2);

        if (dto.fechaReserva().isAfter(fechaMaxima)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La reserva no puede realizarse con más de 2 meses de anticipación");
        }


        // Validar horario
        if (!dto.horarioInicio().isBefore(dto.horarioFin())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El horario de inicio debe ser anterior al horario de fin");
        }

        // Validar duración
        long duracionMinutos = Duration.between(dto.horarioInicio(), dto.horarioFin()).toMinutes();

        if(duracionMinutos != instalacion.getDuracionMinutos()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La duración de la reserva no coincide con la duración de la instalación");
        }

        // Comprobar disponibilidad
        boolean existeConflicto = reservaRepository.existeConflictoHorario(
                dto.idInstalacion(),
                dto.fechaReserva(),
                dto.horarioInicio(),
                dto.horarioFin(),
                List.of(EstadoReserva.RESERVADA, EstadoReserva.BLOQUEADA, EstadoReserva.REPROGRAMADA)
        );

        if (existeConflicto) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El horario seleccionado no está disponible");
        }

        // Crear reserva
        Reserva reserva = reservaMapper.toEntity(dto);

        reserva.setUsuario(usuario);
        reserva.setInstalacion(instalacion);
        reserva.setEstado(EstadoReserva.RESERVADA);

        BigDecimal precioBase = instalacion.getPrecioBase();
        BigDecimal descuento = usuario.getCategoria().getDescuento();

        BigDecimal montoDescuento = precioBase
                .multiply(descuento)
                .divide(BigDecimal.valueOf(100));

        BigDecimal montoFinal = precioBase.subtract(montoDescuento);
        reserva.setMonto(montoFinal);

        // Guardar
        Reserva reservaGuardada = reservaRepository.save(reserva);

        // Devolver respuesta
        return reservaMapper.toResponseDto(reservaGuardada);

    }

    @Override
    public ReservaResponseDto cancelarReserva(Long idReserva) {

        Reserva reserva = reservaRepository.findById(idReserva)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));


        LocalDateTime fechaHoraReserva = LocalDateTime.of(reserva.getFechaReserva(), reserva.getHorarioInicio());

        LocalDateTime ahora = LocalDateTime.now();

        if (fechaHoraReserva.isBefore(ahora.plusHours(48))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La reserva debe cancelarse con al menos 48 horas de anticipación");
        }

        reserva.setEstado(EstadoReserva.CANCELADA);

        Reserva reservaCancelada = reservaRepository.save(reserva);

        return reservaMapper.toResponseDto(reservaCancelada);
    }

    @Override
    public ReservaResponseDto reprogramarReserva(Long idReserva, ReprogramarReservaRequestDto dto) {
        Reserva reserva = reservaRepository.findById(idReserva)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));


        LocalDateTime fechaHoraReservaActual = LocalDateTime.of(reserva.getFechaReserva(), reserva.getHorarioInicio());

        LocalDateTime ahora = LocalDateTime.now();

        if (fechaHoraReservaActual.isBefore(ahora.plusHours(48))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La reserva debe reprogramarse con al menos 48 horas de anticipación");
        }

        // Validar nueva fecha con 48 horas de anticipación
        LocalDateTime nuevaFechaHora = LocalDateTime.of(dto.fechaReserva(), dto.horarioInicio());

        if (nuevaFechaHora.isBefore(ahora.plusHours(48))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nueva fecha debe tener al menos 48 horas de anticipación");
        }

        // Validar máximo de 2 meses
        LocalDate fechaMaxima = LocalDate.now().plusMonths(2);

        if (dto.fechaReserva().isAfter(fechaMaxima)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nueva fecha no puede superar los 2 meses de anticipación");
        }

        // Validar horario
        if (!dto.horarioInicio().isBefore(dto.horarioFin())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El horario de inicio debe ser anterior al horario de fin");
        }

        long duracionMinutos = Duration.between(dto.horarioInicio(), dto.horarioFin()).toMinutes();

        if (duracionMinutos != reserva.getInstalacion().getDuracionMinutos()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La duración de la nueva reserva no coincide con la duración de la instalación");
        }

        boolean existeConflicto = reservaRepository.existeConflictoHorarioReprogramacion(
                reserva.getInstalacion().getId(),
                dto.fechaReserva(),
                dto.horarioInicio(),
                dto.horarioFin(),
                List.of(EstadoReserva.RESERVADA, EstadoReserva.BLOQUEADA, EstadoReserva.REPROGRAMADA),
                reserva.getIdReserva()
        );

        if (existeConflicto) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El nuevo horario seleccionado no está disponible");
        }

        reserva.setFechaReserva(dto.fechaReserva());
        reserva.setHorarioInicio(dto.horarioInicio());
        reserva.setHorarioFin(dto.horarioFin());
        reserva.setEstado(EstadoReserva.REPROGRAMADA);

        Reserva reservaReprogramada = reservaRepository.save(reserva);

        return reservaMapper.toResponseDto(reservaReprogramada);
    }

    @Override
    public List<ReservaResponseDto> obtenerHistorialUsuario(Long idUsuario) {

        // Se verifica que el usuario exista.
        usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        // Se consultan las reservas de los últimos 2 años.
        LocalDate fechaDesde = LocalDate.now().minusYears(2);

        List<Reserva> reservas = reservaRepository
                .findByUsuarioIdUsuarioAndFechaReservaGreaterThanEqual(idUsuario, fechaDesde);

        return reservas.stream()
                .map(reservaMapper::toResponseDto)
                .toList();
    }
}
