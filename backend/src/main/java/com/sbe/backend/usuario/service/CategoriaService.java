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
        String etiqueta = formatearEtiqueta(c.getTipoSocio(), c.getVinculoUnse());

        return new CategoriaResponseDto(
                c.getIdCategoria(),
                c.getTipoSocio(),
                c.getVinculoUnse(),
                etiqueta,
                c.getDescuento(),
                c.getRecargo(),
                c.getCuotaMensual(),
                c.getCuotaTrimestral(),
                c.getCuotaAnual());
    }

    public static String formatearEtiqueta(String tipoSocio, String vinculoUnse) {
        String tipoFormateado;
        if ("SOCIO_INTERNO".equalsIgnoreCase(tipoSocio) || "INTERNO".equalsIgnoreCase(tipoSocio)) {
            tipoFormateado = "Socio Interno";
        } else if ("SOCIO_EXTERNO".equalsIgnoreCase(tipoSocio) || "EXTERNO".equalsIgnoreCase(tipoSocio)) {
            tipoFormateado = "Socio Externo";
        } else if ("NO_SOCIO".equalsIgnoreCase(tipoSocio) || "NO SOCIO".equalsIgnoreCase(tipoSocio)) {
            tipoFormateado = "No Socio";
        } else {
            tipoFormateado = tipoSocio != null ? tipoSocio : "";
        }

        if (vinculoUnse == null || vinculoUnse.isBlank()
                || "SIN_VINCULO_UNSE".equalsIgnoreCase(vinculoUnse)
                || "SIN_VINCULO".equalsIgnoreCase(vinculoUnse)
                || "NINGUNO".equalsIgnoreCase(vinculoUnse)) {
            return tipoFormateado;
        }

        String vinculoFormateado;
        if ("ALUMNO".equalsIgnoreCase(vinculoUnse)) {
            vinculoFormateado = "Alumno";
        } else if ("DOCENTE".equalsIgnoreCase(vinculoUnse)) {
            vinculoFormateado = "Docente";
        } else if ("NODOCENTE".equalsIgnoreCase(vinculoUnse) || "NO_DOCENTE".equalsIgnoreCase(vinculoUnse)) {
            vinculoFormateado = "No Docente";
        } else {
            vinculoFormateado = vinculoUnse.substring(0, 1).toUpperCase() + vinculoUnse.substring(1).toLowerCase();
        }

        return tipoFormateado + " · " + vinculoFormateado;
    }
}