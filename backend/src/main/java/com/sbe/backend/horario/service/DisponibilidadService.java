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
            LocalTime hIni = plantilla.getHoraInicio();
            LocalTime hFin = plantilla.getHoraFin();
            if (hIni == null || hFin == null) {
                continue;
            }

            int startMinutes = hIni.getHour() * 60 + hIni.getMinute();
            int endMinutes = hFin.getHour() * 60 + hFin.getMinute();

            // Si horaFin es 00:00 (medianoche) y horaInicio > 0, representa cierre a las 24:00 (1440 min)
            if (endMinutes <= startMinutes && (hFin.equals(LocalTime.MIDNIGHT) || endMinutes == 0)) {
                endMinutes = 24 * 60;
            }

            if (endMinutes <= startMinutes) {
                continue;
            }

            for (int m = startMinutes; m + duracion <= endMinutes; m += duracion) {
                final int iniM = m;
                final int finM = m + duracion;
                LocalTime bloqueInicio = LocalTime.of(iniM / 60, iniM % 60);
                LocalTime bloqueFin = finM >= 1440 ? LocalTime.of(23, 59, 59) : LocalTime.of(finM / 60, finM % 60);

                boolean tieneConflicto = reservasActivas.stream().anyMatch(r -> {
                    LocalTime rInicio = r.getHorarioInicio();
                    LocalTime rFin = r.getHorarioFin();
                    if (rInicio == null || rFin == null) return false;
                    int rIni = rInicio.getHour() * 60 + rInicio.getMinute();
                    int rF = rFin.getHour() * 60 + rFin.getMinute();
                    if (rF <= rIni && (rFin.equals(LocalTime.MIDNIGHT) || rF == 0)) {
                        rF = 1440;
                    }
                    return rIni < finM && rF > iniM;
                });

                boolean yaPaso = fecha.isEqual(hoy) && bloqueInicio.isBefore(ahora);
                boolean disponible = !tieneConflicto && !yaPaso;

                bloques.add(new BloqueDto(bloqueInicio, bloqueFin, disponible));
            }
        }

        return bloques;
    }
}
