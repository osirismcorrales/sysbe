package com.sbe.backend.reserva.repository;

import com.sbe.backend.reserva.entity.EstadoReserva;
import com.sbe.backend.reserva.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByUsuarioIdUsuarioAndFechaReservaGreaterThanEqual(Long idUsuario, LocalDate fechaDesde);

    List<Reserva> findByInstalacionIdAndFechaReservaAndEstadoIn(Long idInstalacion, LocalDate fechaReserva, List<EstadoReserva> estados);

    // Verifica si existe un conflicto al crear una reserva
    @Query("""
            SELECT COUNT(r) > 0
            FROM Reserva r
            WHERE r.instalacion.id = :idInstalacion
            AND r.fechaReserva = :fechaReserva
            AND r.estado IN :estados
            AND r.horarioInicio < :horarioFin
            AND r.horarioFin > :horarioInicio
            """)
    boolean existeConflictoHorario(
            @Param("idInstalacion") Long idInstalacion,
            @Param("fechaReserva") LocalDate fechaReserva,
            @Param("horarioInicio") LocalTime horarioInicio,
            @Param("horarioFin") LocalTime horarioFin,
            @Param("estados") List<EstadoReserva> estados
    );

    // Verifica conflicto al reprogramar, excluyendo la reserva actual
    @Query("""
            SELECT COUNT(r) > 0
            FROM Reserva r
            WHERE r.instalacion.id = :idInstalacion
            AND r.fechaReserva = :fechaReserva
            AND r.estado IN :estados
            AND r.idReserva <> :idReserva
            AND r.horarioInicio < :horarioFin
            AND r.horarioFin > :horarioInicio
            """)
    boolean existeConflictoHorarioReprogramacion(
            @Param("idInstalacion") Long idInstalacion,
            @Param("fechaReserva") LocalDate fechaReserva,
            @Param("horarioInicio") LocalTime horarioInicio,
            @Param("horarioFin") LocalTime horarioFin,
            @Param("estados") List<EstadoReserva> estados,
            @Param("idReserva") Long idReserva
    );
}
