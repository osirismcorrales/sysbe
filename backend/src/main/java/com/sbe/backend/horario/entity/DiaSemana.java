package com.sbe.backend.horario.entity;

import java.time.DayOfWeek;

public enum DiaSemana {
    LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO;

    public static DiaSemana from(DayOfWeek d) {
        return values()[d.getValue() - 1];   // DayOfWeek: lunes = 1
    }
}