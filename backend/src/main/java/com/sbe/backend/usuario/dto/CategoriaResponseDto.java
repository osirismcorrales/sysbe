package com.sbe.backend.usuario.dto;

import java.math.BigDecimal;

public record CategoriaResponseDto(
        Integer idCategoria,
        String tipoSocio,
        String vinculoUnse,      // puede ser null
        String etiqueta,         // texto listo para mostrar en el selector
        BigDecimal descuento,
        BigDecimal cuotaMensual,
        BigDecimal cuotaTrimestral,
        BigDecimal cuotaAnual
) {}