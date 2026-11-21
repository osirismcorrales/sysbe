package com.sbe.backend.reporte.repository;

import com.sbe.backend.reporte.dto.PagoReporteDto;
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
        WHERE (:dni IS NULL OR u.dni LIKE CONCAT('%', CAST(:dni AS string), '%'))
          AND (:nombreUsuario IS NULL OR LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', CAST(:nombreUsuario AS string), '%')))
          AND (:tipoUsuario IS NULL OR LOWER(CAST(u.categoria.tipoSocio AS string)) = LOWER(CAST(:tipoUsuario AS string)))
          AND (:tipoInstalacion IS NULL OR LOWER(i.nombre) = LOWER(CAST(:tipoInstalacion AS string)))
          AND (:estado IS NULL OR UPPER(CAST(r.estado AS string)) = UPPER(CAST(:estado AS string)))
          AND (CAST(:fechaDesde AS date) IS NULL OR r.fechaReserva >= :fechaDesde)
          AND (CAST(:fechaHasta AS date) IS NULL OR r.fechaReserva <= :fechaHasta)
        ORDER BY u.nombreCompleto ASC, r.fechaReserva ASC
    """, countQuery = """
        SELECT count(r)
        FROM Reserva r
        JOIN r.usuario u
        JOIN r.instalacion i
        WHERE (:dni IS NULL OR u.dni LIKE CONCAT('%', CAST(:dni AS string), '%'))
          AND (:nombreUsuario IS NULL OR LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', CAST(:nombreUsuario AS string), '%')))
          AND (:tipoUsuario IS NULL OR LOWER(CAST(u.categoria.tipoSocio AS string)) = LOWER(CAST(:tipoUsuario AS string)))
          AND (:tipoInstalacion IS NULL OR LOWER(i.nombre) = LOWER(CAST(:tipoInstalacion AS string)))
          AND (:estado IS NULL OR UPPER(CAST(r.estado AS string)) = UPPER(CAST(:estado AS string)))
          AND (CAST(:fechaDesde AS date) IS NULL OR r.fechaReserva >= :fechaDesde)
          AND (CAST(:fechaHasta AS date) IS NULL OR r.fechaReserva <= :fechaHasta)
    """)
    Page<ReservaReporteDto> obtenerReporteReservas(
            @Param("dni") String dni,
            @Param("nombreUsuario") String nombreUsuario,
            @Param("tipoUsuario") String tipoUsuario,
            @Param("tipoInstalacion") String tipoInstalacion,
            @Param("estado") String estado,
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
        WHERE (:dni IS NULL OR u.dni LIKE CONCAT('%', CAST(:dni AS string), '%'))
          AND (:nombreUsuario IS NULL OR LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', CAST(:nombreUsuario AS string), '%')))
          AND (:tipoUsuario IS NULL OR LOWER(CAST(u.categoria.tipoSocio AS string)) = LOWER(CAST(:tipoUsuario AS string)))
          AND (:tipoInstalacion IS NULL OR LOWER(i.nombre) = LOWER(CAST(:tipoInstalacion AS string)))
          AND (:estado IS NULL OR UPPER(CAST(r.estado AS string)) = UPPER(CAST(:estado AS string)))
          AND (CAST(:fechaDesde AS date) IS NULL OR r.fechaReserva >= :fechaDesde)
          AND (CAST(:fechaHasta AS date) IS NULL OR r.fechaReserva <= :fechaHasta)
        ORDER BY u.nombreCompleto ASC, r.fechaReserva ASC
    """)
    List<ReservaReporteDto> obtenerReporteReservas(
            @Param("dni") String dni,
            @Param("nombreUsuario") String nombreUsuario,
            @Param("tipoUsuario") String tipoUsuario,
            @Param("tipoInstalacion") String tipoInstalacion,
            @Param("estado") String estado,
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
          AND (:dni IS NULL OR u.dni LIKE CONCAT('%', CAST(:dni AS string), '%'))
          AND (:nombreUsuario IS NULL OR LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', CAST(:nombreUsuario AS string), '%')))
          AND (:tipoUsuario IS NULL OR LOWER(CAST(u.categoria.tipoSocio AS string)) = LOWER(CAST(:tipoUsuario AS string)))
        ORDER BY u.nombreCompleto ASC
    """, countQuery = """
        SELECT count(u)
        FROM Usuario u
        WHERE u.estado = com.sbe.backend.usuario.entity.Usuario.EstadoUsuario.ACTIVO
          AND CAST(u.categoria.tipoSocio AS string) != 'NO_SOCIO'
          AND (:dni IS NULL OR u.dni LIKE CONCAT('%', CAST(:dni AS string), '%'))
          AND (:nombreUsuario IS NULL OR LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', CAST(:nombreUsuario AS string), '%')))
          AND (:tipoUsuario IS NULL OR LOWER(CAST(u.categoria.tipoSocio AS string)) = LOWER(CAST(:tipoUsuario AS string)))
    """)
    Page<SocioActivoReporteDto> obtenerReporteSociosActivos(
            @Param("dni") String dni,
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
          AND (:dni IS NULL OR u.dni LIKE CONCAT('%', CAST(:dni AS string), '%'))
          AND (:nombreUsuario IS NULL OR LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', CAST(:nombreUsuario AS string), '%')))
          AND (:tipoUsuario IS NULL OR LOWER(CAST(u.categoria.tipoSocio AS string)) = LOWER(CAST(:tipoUsuario AS string)))
        ORDER BY u.nombreCompleto ASC
    """)
    List<SocioActivoReporteDto> obtenerReporteSociosActivos(
            @Param("dni") String dni,
            @Param("nombreUsuario") String nombreUsuario,
            @Param("tipoUsuario") String tipoUsuario
    );

    @Query(value = """
        SELECT new com.sbe.backend.reporte.dto.PagoReporteDto(
            p.idPago,
            COALESCE(u.dni, 'Sin DNI'),
            u.nombreCompleto,
            CAST(p.tipoPago AS string),
            p.periodo,
            r.idReserva,
            p.montoPago,
            CAST(p.metodoPago AS string),
            CAST(p.estadoPago AS string),
            p.fechaCreacion,
            p.fechaPago
        )
        FROM Pago p
        JOIN p.usuario u
        LEFT JOIN p.reserva r
        WHERE (:dni IS NULL OR u.dni LIKE CONCAT('%', CAST(:dni AS string), '%'))
          AND (:nombreUsuario IS NULL OR LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', CAST(:nombreUsuario AS string), '%')))
          AND (:tipoPago IS NULL OR UPPER(CAST(p.tipoPago AS string)) = UPPER(CAST(:tipoPago AS string)))
          AND (:estado IS NULL OR UPPER(CAST(p.estadoPago AS string)) = UPPER(CAST(:estado AS string)))
          AND (CAST(:fechaDesde AS date) IS NULL OR CAST(p.fechaCreacion AS date) >= :fechaDesde)
          AND (CAST(:fechaHasta AS date) IS NULL OR CAST(p.fechaCreacion AS date) <= :fechaHasta)
        ORDER BY p.fechaCreacion DESC
    """, countQuery = """
        SELECT count(p)
        FROM Pago p
        JOIN p.usuario u
        WHERE (:dni IS NULL OR u.dni LIKE CONCAT('%', CAST(:dni AS string), '%'))
          AND (:nombreUsuario IS NULL OR LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', CAST(:nombreUsuario AS string), '%')))
          AND (:tipoPago IS NULL OR UPPER(CAST(p.tipoPago AS string)) = UPPER(CAST(:tipoPago AS string)))
          AND (:estado IS NULL OR UPPER(CAST(p.estadoPago AS string)) = UPPER(CAST(:estado AS string)))
          AND (CAST(:fechaDesde AS date) IS NULL OR CAST(p.fechaCreacion AS date) >= :fechaDesde)
          AND (CAST(:fechaHasta AS date) IS NULL OR CAST(p.fechaCreacion AS date) <= :fechaHasta)
    """)
    Page<PagoReporteDto> obtenerReportePagos(
            @Param("dni") String dni,
            @Param("nombreUsuario") String nombreUsuario,
            @Param("tipoPago") String tipoPago,
            @Param("estado") String estado,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta,
            Pageable pageable
    );

    @Query("""
        SELECT new com.sbe.backend.reporte.dto.PagoReporteDto(
            p.idPago,
            COALESCE(u.dni, 'Sin DNI'),
            u.nombreCompleto,
            CAST(p.tipoPago AS string),
            p.periodo,
            r.idReserva,
            p.montoPago,
            CAST(p.metodoPago AS string),
            CAST(p.estadoPago AS string),
            p.fechaCreacion,
            p.fechaPago
        )
        FROM Pago p
        JOIN p.usuario u
        LEFT JOIN p.reserva r
        WHERE (:dni IS NULL OR u.dni LIKE CONCAT('%', CAST(:dni AS string), '%'))
          AND (:nombreUsuario IS NULL OR LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', CAST(:nombreUsuario AS string), '%')))
          AND (:tipoPago IS NULL OR UPPER(CAST(p.tipoPago AS string)) = UPPER(CAST(:tipoPago AS string)))
          AND (:estado IS NULL OR UPPER(CAST(p.estadoPago AS string)) = UPPER(CAST(:estado AS string)))
          AND (CAST(:fechaDesde AS date) IS NULL OR CAST(p.fechaCreacion AS date) >= :fechaDesde)
          AND (CAST(:fechaHasta AS date) IS NULL OR CAST(p.fechaCreacion AS date) <= :fechaHasta)
        ORDER BY p.fechaCreacion DESC
    """)
    List<PagoReporteDto> obtenerReportePagos(
            @Param("dni") String dni,
            @Param("nombreUsuario") String nombreUsuario,
            @Param("tipoPago") String tipoPago,
            @Param("estado") String estado,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta
    );
}