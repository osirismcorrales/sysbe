package com.sbe.backend.instalacion.service;

import com.sbe.backend.instalacion.dto.InstalacionRequestDto;
import com.sbe.backend.instalacion.dto.InstalacionResponseDto;
import com.sbe.backend.instalacion.entity.Instalacion;
import com.sbe.backend.instalacion.mapper.InstalacionMapper;
import com.sbe.backend.instalacion.repository.InstalacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InstalacionService {

    private final InstalacionRepository instalacionRepository;
    private final InstalacionMapper instalacionMapper;


    @Transactional(readOnly = true)
    public List<InstalacionResponseDto> findAll() {
        return instalacionRepository.findAll()
                .stream()
                .map(instalacionMapper::toResponseDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public InstalacionResponseDto findById(Long id) {
        return instalacionMapper.toResponseDto(instalacionRepository.findById(id).orElseThrow());
    }

    @Transactional
    public InstalacionResponseDto create(InstalacionRequestDto instalacionRequestDto) {
        Instalacion instalacion = instalacionMapper.toEntity(instalacionRequestDto);

        Instalacion guardado = instalacionRepository.save(instalacion);
        return instalacionMapper.toResponseDto(guardado);
    }

    @Transactional
    public InstalacionResponseDto update(Long id, InstalacionRequestDto instalacionRequestDto) {
        Instalacion instalacion = instalacionRepository.findById(id).orElseThrow(()-> new RuntimeException("Instalacion no encontrado"));

        instalacion.setNombre(instalacionRequestDto.nombre());
        instalacion.setDescripcion(instalacionRequestDto.descripcion());
        instalacion.setEstado(instalacionRequestDto.estado());
        instalacion.setPrecioBase(instalacionRequestDto.precioBase());
        instalacion.setDuracionMinutos(instalacionRequestDto.duracionMinutos());

        return instalacionMapper.toResponseDto(instalacionRepository.save(instalacion));

    }

    @Transactional
    public void delete(Long id) {
        Instalacion instalacion = instalacionRepository.findById(id).orElseThrow(() -> new RuntimeException("No existe la instalacion con el id: " + id));

        instalacion.setEstado("Inactivo");
    }
}
