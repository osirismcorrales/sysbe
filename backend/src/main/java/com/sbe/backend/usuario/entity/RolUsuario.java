package com.sbe.backend.usuario.entity;

/**
 * Enum de roles del sistema.
 *
 * CONVENCIONES:
 *  - Agregar nuevos roles aqui si es necesario
 *  - Spring Security usa estos valores para definir permisos
 *  - En la DB se guarda como String (ej: "ADMIN", "SOCIO")
 */
public enum RolUsuario {
    /** Administrador con acceso total */
    ADMIN,

    /** Empleado del club */
    EMPLEADO,

    /** Socio que puede reservar instalaciones */
    SOCIO
}
