package com.sbe.backend.instalacion.repository;

import com.sbe.backend.instalacion.entity.Instalacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InstalacionRepository extends JpaRepository<Instalacion, Long>{
    // SELECT * FROM instalaciones WHERE UPPER(estado) = UPPER(?)
    List<Instalacion> findByEstadoIgnoreCase(String estado);
}
