package com.sbe.backend.usuario.repository;

import com.sbe.backend.usuario.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

    boolean existsByTipoSocioAndVinculoUnse(String tipoSocio, String vinculoUnse);

    Optional<Categoria> findByTipoSocioAndVinculoUnse(String tipoSocio, String vinculoUnse);

    // 2. Para particulares/externos que no tienen vínculo UNSE (ej: "SOCIO_EXTERNO" o "NO_SOCIO")
    Optional<Categoria> findByTipoSocio(String tipoSocio);
}