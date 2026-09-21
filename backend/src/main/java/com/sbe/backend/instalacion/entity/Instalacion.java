package com.sbe.backend.instalacion.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "instalaciones")
@Builder
public class Instalacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_instalacion")
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String nombre;


    @Column(nullable = false, length = 60)
    private String descripcion;

    @NotBlank
    @Column(nullable = false, length = 40)
    private String estado;


    @DecimalMin(value = "0.0", inclusive = false)
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precioBase;


    @Min(1)
    @Column(nullable = false)
    private Integer duracionMinutos;
}
