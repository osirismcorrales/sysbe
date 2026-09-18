package com.sbe.backend.usuario.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entidad JPA que representa a un Usuario del sistema.
 *
 * CONVENCIONES:
 *  - Siempre anotar con @Entity y @Table(name = "nombre_tabla")
 *  - Usar @Id + @GeneratedValue para la PK
 *  - No exponer la entidad directamente en la API → usar DTOs
 *  - Lombok: @Getter/@Setter en vez de @Data para evitar problemas con JPA
 */
@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Email unico, se usa como nombre de usuario para login */
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /** Password hasheado (bcrypt). NUNCA guardar en texto plano. */
    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(nullable = false, length = 80)
    private String apellido;

    /**
     * Rol del usuario en el sistema.
     * Usamos @Enumerated(STRING) para guardar el nombre del enum como texto en la DB,
     * lo cual es mas legible y resistente a cambios de orden.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolUsuario rol;

    /** Si el usuario esta activo o fue dado de baja logica */
    @Column(nullable = false)
    @Builder.Default
    private boolean activo = true;
}
