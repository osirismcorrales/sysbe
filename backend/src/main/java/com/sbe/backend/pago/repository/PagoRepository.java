package com.sbe.backend.pago.repository;

import com.sbe.backend.pago.entity.EstadoPago;
import com.sbe.backend.pago.entity.Pago;
import com.sbe.backend.pago.entity.TipoPago;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    Page<Pago> findByUsuarioIdUsuario(Long idUsuario, Pageable pageable);

    List<Pago> findByUsuarioIdUsuario(Long idUsuario);

    Optional<Pago> findByReservaIdReserva(Long idReserva);

    Page<Pago> findByEstadoPago(EstadoPago estadoPago, Pageable pageable);

    Page<Pago> findByTipoPago(TipoPago tipoPago, Pageable pageable);

    Optional<Pago> findByPeriodoAndUsuarioIdUsuario(String periodo, Long idUsuario);

    @Query("""
        SELECT p FROM Pago p
        WHERE (:idUsuario IS NULL OR p.usuario.idUsuario = :idUsuario)
          AND (:estadoPago IS NULL OR p.estadoPago = :estadoPago)
          AND (:tipoPago IS NULL OR p.tipoPago = :tipoPago)
    """)
    Page<Pago> listarConFiltros(
            @Param("idUsuario") Long idUsuario,
            @Param("estadoPago") EstadoPago estadoPago,
            @Param("tipoPago") TipoPago tipoPago,
            Pageable pageable
    );
}
