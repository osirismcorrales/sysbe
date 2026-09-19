package com.sbe.backend.usuario.repository;

import com.sbe.backend.usuario.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {

    boolean existsByNombreRol(String nombreRol);

    Optional<Rol> findByNombreRol(String nombreRol);
}