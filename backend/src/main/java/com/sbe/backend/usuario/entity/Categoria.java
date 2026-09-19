package com.sbe.backend.usuario.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import jakarta.persistence.Column;

import java.text.DecimalFormat;

@Entity
@Table(name = "categoria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column(name = "id_categoria")
    private Integer idCategoria;

    @Column(name = "tipo_socio", nullable = false, length = 30)
    private String tipoSocio;

    @Column(name = "vinculo_unse", nullable = false, length = 30)
    private String vinculoU;

    @Column(name = "descuento_porcentaje", nullable = false, precision = 5, scale = 2)
    private BigDecimal descuento;

    @Column(name = "cuota_mensual", nullable = false, precision = 10, scale = 2)
    private BigDecimal cuotaMensual;

    @Column(name = "cuota_trimestral", nullable = false, precision = 10, scale = 2)
    private BigDecimal cuotaTrimenstral;

    @Column(name = "cuota_anual", nullable = false, precision = 10, scale = 2)
    private BigDecimal cuotaAnual;

}
