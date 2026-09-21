package com.sbe.backend.horario.service;

import com.sbe.backend.horario.dto.PlantillaHorarioRequestDto;
import com.sbe.backend.horario.dto.PlantillaHorarioResponseDto;
import com.sbe.backend.horario.entity.PlantillaHorario;
import com.sbe.backend.horario.mapper.PlantillaHorarioMapper;
import com.sbe.backend.horario.repository.PlantillaHorarioRepository;
import com.sbe.backend.instalacion.entity.Instalacion;
import com.sbe.backend.instalacion.repository.InstalacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PlantillaHorarioService {

    private final PlantillaHorarioRepository plantillaRepository;
    private final InstalacionRepository instalacionRepository;
    private final PlantillaHorarioMapper plantillaMapper;

    @Transactional(readOnly = true)
    public List<PlantillaHorarioResponseDto> listar(Long idInstalacion) {
        List<PlantillaHorario> lista = (idInstalacion == null)
                ? plantillaRepository.findAll()
                : plantillaRepository.findByInstalacionIdOrderByDiaSemanaAscHoraInicioAsc(idInstalacion);

        return lista.stream().map(plantillaMapper::toResponseDto).toList();
    }

    @Transactional(readOnly = true)
    public PlantillaHorarioResponseDto buscarPorId(Long id) {
        return plantillaMapper.toResponseDto(findOrThrow(id));
    }

    @Transactional
    public PlantillaHorarioResponseDto crear(PlantillaHorarioRequestDto dto) {
        Instalacion instalacion = findInstalacion(dto.idInstalacion());
        validar(dto, null);

        PlantillaHorario guardada = plantillaRepository.save(plantillaMapper.toEntity(dto, instalacion));
        return plantillaMapper.toResponseDto(guardada);
    }

    @Transactional
    public PlantillaHorarioResponseDto actualizar(Long id, PlantillaHorarioRequestDto dto) {
        PlantillaHorario plantilla = findOrThrow(id);
        Instalacion instalacion = findInstalacion(dto.idInstalacion());
        validar(dto, id);

        plantillaMapper.updateEntity(dto, plantilla, instalacion);
        return plantillaMapper.toResponseDto(plantilla);
    }

    @Transactional
    public void eliminar(Long id) {
        plantillaRepository.delete(findOrThrow(id));
    }

    // ---------- helpers ----------

    private void validar(PlantillaHorarioRequestDto dto, Long idExcluir) {
        if (!dto.horaFin().isAfter(dto.horaInicio())) {
            throw new IllegalArgumentException("La hora de fin debe ser posterior a la de inicio");
        }

        boolean solapa = plantillaRepository
                .findByInstalacionIdAndDiaSemanaOrderByHoraInicio(dto.idInstalacion(), dto.diaSemana())
                .stream()
                .filter(p -> !p.getId().equals(idExcluir))   // al editar, ignora la propia
                .anyMatch(p -> p.getHoraInicio().isBefore(dto.horaFin())
                        && p.getHoraFin().isAfter(dto.horaInicio()));

        if (solapa) {
            throw new IllegalArgumentException("El horario se solapa con otro ya cargado para ese día");
        }
    }

    private PlantillaHorario findOrThrow(Long id) {
        return plantillaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Plantilla no encontrada con id: " + id));
    }

    private Instalacion findInstalacion(Long id) {
        return instalacionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Instalación no encontrada con id: " + id));
    }
}