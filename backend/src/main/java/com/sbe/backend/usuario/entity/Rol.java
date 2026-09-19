package com.sbe.backend.usuario.entity;

import jakarta.persistence.*;
import lombok.*;
import jakarta.persistence.Column;

@Entity
@Table(name = "rol")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Rol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column(name = "id_rol")
    private Integer idRol;

    @Column(name = "nombre_rol", nullable = false, unique = false, length = 40)
    private String nombreRol;

    @Column(name = "descripcion", nullable = false, unique = false, length = 100)
    private String desc;

}
