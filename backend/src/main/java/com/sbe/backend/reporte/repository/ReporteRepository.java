package com.sbe.backend.reporte.repository;

import com.sbe.backend.reporte.dto.ReservaReporteDto;
import com.sbe.backend.reporte.dto.SocioActivoReporteDto;
import com.sbe.backend.usuario.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReporteRepository extends JpaRepository<Usuario, Long> {

    @Query(value = """
        SELECT new com.sbe.backend.reporte.dto.ReservaReporteDto(
            COALESCE(u.dni, 'Sin DNI'),
            u.nombreCompleto,
            CAST(u.categoria.tipoSocio AS string),
            i.nombre,
            r.fechaReserva,
            CAST(r.estado AS string)
        )
        FROM Reserva r
        JOIN r.usuario u
        JOIN r.instalacion i
        WHERE (:nombreUsuario IS NULL OR LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', CAST(:nombreUsuario AS string), '%')))
          AND (:tipoUsuario IS NULL OR LOWER(CAST(u.categoria.tipoSocio AS string)) = LOWER(CAST(:tipoUsuario AS string)))
          AND (:tipoInstalacion IS NULL OR LOWER(i.nombre) = LOWER(CAST(:tipoInstalacion AS string)))
          AND (CAST(:fechaDesde AS date) IS NULL OR r.fechaReserva >= :fechaDesde)
          AND (CAST(:fechaHasta AS date) IS NULL OR r.fechaReserva <= :fechaHasta)
        ORDER BY r.fechaReserva DESC
    """, countQuery = """
        SELECT count(r)
        FROM Reserva r
        JOIN r.usuario u
        JOIN r.instalacion i
        WHERE (:nombreUsuario IS NULL OR LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', CAST(:nombreUsuario AS string), '%')))
          AND (:tipoUsuario IS NULL OR LOWER(CAST(u.categoria.tipoSocio AS string)) = LOWER(CAST(:tipoUsuario AS string)))
          AND (:tipoInstalacion IS NULL OR LOWER(i.nombre) = LOWER(CAST(:tipoInstalacion AS string)))
          AND (CAST(:fechaDesde AS date) IS NULL OR r.fechaReserva >= :fechaDesde)
          AND (CAST(:fechaHasta AS date) IS NULL OR r.fechaReserva <= :fechaHasta)
    """)
    Page<ReservaReporteDto> obtenerReporteReservas(
            @Param("nombreUsuario") String nombreUsuario,
            @Param("tipoUsuario") String tipoUsuario,
            @Param("tipoInstalacion") String tipoInstalacion,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta,
            Pageable pageable
    );

    @Query("""
        SELECT new com.sbe.backend.reporte.dto.ReservaReporteDto(
            COALESCE(u.dni, 'Sin DNI'),
            u.nombreCompleto,
            CAST(u.categoria.tipoSocio AS string),
            i.nombre,
            r.fechaReserva,
            CAST(r.estado AS string)
        )
        FROM Reserva r
        JOIN r.usuario u
        JOIN r.instalacion i
        WHERE (:nombreUsuario IS NULL OR LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', CAST(:nombreUsuario AS string), '%')))
          AND (:tipoUsuario IS NULL OR LOWER(CAST(u.categoria.tipoSocio AS string)) = LOWER(CAST(:tipoUsuario AS string)))
          AND (:tipoInstalacion IS NULL OR LOWER(i.nombre) = LOWER(CAST(:tipoInstalacion AS string)))
          AND (CAST(:fechaDesde AS date) IS NULL OR r.fechaReserva >= :fechaDesde)
          AND (CAST(:fechaHasta AS date) IS NULL OR r.fechaReserva <= :fechaHasta)
        ORDER BY r.fechaReserva DESC
    """)
    List<ReservaReporteDto> obtenerReporteReservas(
            @Param("nombreUsuario") String nombreUsuario,
            @Param("tipoUsuario") String tipoUsuario,
            @Param("tipoInstalacion") String tipoInstalacion,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta
    );

    @Query(value = """
        SELECT new com.sbe.backend.reporte.dto.SocioActivoReporteDto(
            COALESCE(u.dni, 'Sin DNI'),
            u.nombreCompleto,
            CAST(u.categoria.tipoSocio AS string),
            u.email,
            CAST(u.estado AS string)
        )
        FROM Usuario u
        WHERE u.estado = com.sbe.backend.usuario.entity.Usuario.EstadoUsuario.ACTIVO
          AND CAST(u.categoria.tipoSocio AS string) != 'NO_SOCIO'
          AND (:nombreUsuario IS NULL OR LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', CAST(:nombreUsuario AS string), '%')))
          AND (:tipoUsuario IS NULL OR LOWER(CAST(u.categoria.tipoSocio AS string)) = LOWER(CAST(:tipoUsuario AS string)))
        ORDER BY u.nombreCompleto ASC
    """, countQuery = """
        SELECT count(u)
        FROM Usuario u
        WHERE u.estado = com.sbe.backend.usuario.entity.Usuario.EstadoUsuario.ACTIVO
          AND CAST(u.categoria.tipoSocio AS string) != 'NO_SOCIO'
          AND (:nombreUsuario IS NULL OR LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', CAST(:nombreUsuario AS string), '%')))
          AND (:tipoUsuario IS NULL OR LOWER(CAST(u.categoria.tipoSocio AS string)) = LOWER(CAST(:tipoUsuario AS string)))
    """)
    Page<SocioActivoReporteDto> obtenerReporteSociosActivos(
            @Param("nombreUsuario") String nombreUsuario,
            @Param("tipoUsuario") String tipoUsuario,
            Pageable pageable
    );

    @Query("""
        SELECT new com.sbe.backend.reporte.dto.SocioActivoReporteDto(
            COALESCE(u.dni, 'Sin DNI'),
            u.nombreCompleto,
            CAST(u.categoria.tipoSocio AS string),
            u.email,
            CAST(u.estado AS string)
        )
        FROM Usuario u
        WHERE u.estado = com.sbe.backend.usuario.entity.Usuario.EstadoUsuario.ACTIVO
          AND CAST(u.categoria.tipoSocio AS string) != 'NO_SOCIO'
          AND (:nombreUsuario IS NULL OR LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', CAST(:nombreUsuario AS string), '%')))
          AND (:tipoUsuario IS NULL OR LOWER(CAST(u.categoria.tipoSocio AS string)) = LOWER(CAST(:tipoUsuario AS string)))
        ORDER BY u.nombreCompleto ASC
    """)
    List<SocioActivoReporteDto> obtenerReporteSociosActivos(
            @Param("nombreUsuario") String nombreUsuario,
            @Param("tipoUsuario") String tipoUsuario
    );
}