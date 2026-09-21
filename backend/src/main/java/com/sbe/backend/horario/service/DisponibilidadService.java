package com.sbe.backend.horario.service;

import com.sbe.backend.horario.dto.BloqueDto;
import com.sbe.backend.horario.entity.DiaSemana;
import com.sbe.backend.horario.entity.PlantillaHorario;
import com.sbe.backend.horario.repository.PlantillaHorarioRepository;
import com.sbe.backend.instalacion.entity.Instalacion;
import com.sbe.backend.instalacion.repository.InstalacionRepository;
import com.sbe.backend.reserva.entity.EstadoReserva;
import com.sbe.backend.reserva.entity.Reserva;
import com.sbe.backend.reserva.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DisponibilidadService {

    private final InstalacionRepository instalacionRepository;
    private final PlantillaHorarioRepository plantillaRepository;
    private final ReservaRepository reservaRepository;

    @Transactional(readOnly = true)
    public List<BloqueDto> consultarDisponibilidad(Long idInstalacion, LocalDate fecha) {
        Instalacion instalacion = instalacionRepository.findById(idInstalacion)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Instalación no encontrada con id: " + idInstalacion));

        if (!"Habilitada".equalsIgnoreCase(instalacion.getEstado())) {
            return List.of();
        }

        DiaSemana diaSemana = DiaSemana.from(fecha.getDayOfWeek());

        List<PlantillaHorario> plantillas = plantillaRepository
                .findByInstalacionIdAndDiaSemanaOrderByHoraInicio(idInstalacion, diaSemana);

        if (plantillas.isEmpty()) {
            return List.of();
        }

        List<Reserva> reservasActivas = reservaRepository.findByInstalacionIdAndFechaReservaAndEstadoIn(
                idInstalacion,
                fecha,
                List.of(EstadoReserva.RESERVADA, EstadoReserva.BLOQUEADA, EstadoReserva.REPROGRAMADA)
        );

        int duracion = instalacion.getDuracionMinutos() != null && instalacion.getDuracionMinutos() > 0
                ? instalacion.getDuracionMinutos()
                : 60;

        List<BloqueDto> bloques = new ArrayList<>();
        LocalDate hoy = LocalDate.now();
        LocalTime ahora = LocalTime.now();

        for (PlantillaHorario plantilla : plantillas) {
            LocalTime cursor = plantilla.getHoraInicio();
            LocalTime fin = plantilla.getHoraFin();

            while (!cursor.plusMinutes(duracion).isAfter(fin)) {
                LocalTime bloqueInicio = cursor;
                LocalTime bloqueFin = cursor.plusMinutes(duracion);

                boolean tieneConflicto = reservasActivas.stream().anyMatch(r ->
                        r.getHorarioInicio().isBefore(bloqueFin) && r.getHorarioFin().isAfter(bloqueInicio)
                );

                boolean yaPaso = fecha.isEqual(hoy) && bloqueInicio.isBefore(ahora);

                boolean disponible = !tieneConflicto && !yaPaso;

                bloques.add(new BloqueDto(bloqueInicio, bloqueFin, disponible));

                cursor = cursor.plusMinutes(duracion);
            }
        }

        return bloques;
    }
}
