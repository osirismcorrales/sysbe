package com.sbe.backend.usuario.repository;

import com.sbe.backend.usuario.entity.Rol;
import com.sbe.backend.usuario.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

/**
 * Repository para la entidad Usuario.
 *
 * CONVENCIONES:
 *  - Extender JpaRepository<Entidad, TipoDePK>
 *  - Spring Data genera las queries a partir del nombre del metodo (Query Derivation)
 *  - Para queries complejas usar @Query con JPQL o SQL nativo
 *  - NO poner logica de negocio aqui → solo acceso a datos
 *
 * Metodos utiles de JpaRepository que ya vienen gratis:
 *  - save(entity)           → INSERT o UPDATE
 *  - findById(id)           → SELECT por PK, devuelve Optional
 *  - findAll()              → SELECT *
 *  - deleteById(id)         → DELETE por PK
 *  - existsById(id)         → SELECT COUNT > 0
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Busca un usuario por email.
     * Spring Data genera: SELECT * FROM usuarios WHERE email = ?
     */
    Optional<Usuario> findByEmail(String email);

    /**
     * Verifica si ya existe un usuario con ese email (para validar duplicados).
     */
    boolean existsByEmail(String email);

    /**
     * Retorna todos los usuarios con un rol especifico.
     */
    List<Usuario> findByRol(Rol rol);

    /**
     * Retorna todos los usuarios activos.
     */
    List<Usuario> findByEstado(Usuario.EstadoUsuario estadoUsuario);

    // Agregar esta línea:
    Optional<Usuario> findByDni(String dni);

    // Opcional pero muy útil para validar duplicados antes de guardar:
    boolean existsByDni(String dni);

    @Query("SELECT u FROM Usuario u WHERE u.estado = 'ACTIVO' AND u.categoria.tipoSocio <> 'NO_SOCIO'")
    List<Usuario> listarSoloSocios();

}
