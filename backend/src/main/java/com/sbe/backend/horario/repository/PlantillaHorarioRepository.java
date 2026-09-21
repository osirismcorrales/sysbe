package com.sbe.backend.horario.repository;

import com.sbe.backend.horario.entity.DiaSemana;
import com.sbe.backend.horario.entity.PlantillaHorario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;



public interface PlantillaHorarioRepository extends JpaRepository<PlantillaHorario, Long> {

    List<PlantillaHorario> findByInstalacionIdAndDiaSemanaOrderByHoraInicio(Long idInstalacion, DiaSemana dia);

    List<PlantillaHorario> findByInstalacionId(Long idInstalacion);
}