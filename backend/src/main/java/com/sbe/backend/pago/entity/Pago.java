package com.sbe.backend.pago.entity;

import com.sbe.backend.reserva.entity.Reserva;
import com.sbe.backend.usuario.entity.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Long idPago;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva", nullable = true)
    private Reserva reserva;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pago", nullable = false, length = 30)
    private TipoPago tipoPago;

    @Column(name = "periodo", length = 7)
    private String periodo;

    @Column(name = "monto_pago", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoPago;

    @Column(name = "puntos_usados")
    @Builder.Default
    private Integer puntosUsados = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false, length = 30)
    private MetodoPago metodoPago;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pago", nullable = false, length = 30)
    private EstadoPago estadoPago;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrado_por", nullable = true)
    private Usuario registradoPor;

    @PrePersist
    public void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
        if (this.estadoPago == null) {
            this.estadoPago = EstadoPago.PENDIENTE;
        }
        if (this.estadoPago == EstadoPago.APROBADO && this.fechaPago == null) {
            this.fechaPago = LocalDateTime.now();
        }
    }
}
