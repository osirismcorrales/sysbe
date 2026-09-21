package com.sbe.backend.usuario.service;

import com.sbe.backend.usuario.dto.CategoriaResponseDto;
import com.sbe.backend.usuario.entity.Categoria;
import com.sbe.backend.usuario.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<CategoriaResponseDto> listarTodas() {
        return categoriaRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    private CategoriaResponseDto toDto(Categoria c) {
        String etiqueta = c.getVinculoUnse() == null
                ? c.getTipoSocio()
                : c.getTipoSocio() + " · " + c.getVinculoUnse();

        return new CategoriaResponseDto(
                c.getIdCategoria(),
                c.getTipoSocio(),
                c.getVinculoUnse(),
                etiqueta,
                c.getDescuento(),
                c.getCuotaMensual(),
                c.getCuotaTrimestral(),
                c.getCuotaAnual());
    }
}