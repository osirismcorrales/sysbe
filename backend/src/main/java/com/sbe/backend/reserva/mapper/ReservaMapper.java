package com.sbe.backend.reserva.mapper;

import com.sbe.backend.reserva.dto.ReservaRequestDto;
import com.sbe.backend.reserva.dto.ReservaResponseDto;
import com.sbe.backend.reserva.entity.Reserva;
import org.springframework.stereotype.Component;

@Component
public class ReservaMapper {

    public Reserva toEntity(ReservaRequestDto dto){

        return Reserva.builder()
                .fechaReserva(dto.fechaReserva())
                .horarioInicio(dto.horarioInicio())
                .horarioFin(dto.horarioFin())
                .build();
    }

    public ReservaResponseDto toResponseDto(Reserva reserva){

        return new ReservaResponseDto(
                reserva.getIdReserva(),
                reserva.getFechaReserva(),
                reserva.getHorarioInicio(),
                reserva.getHorarioFin(),
                reserva.getEstado(),
                reserva.getMonto(),
                reserva.getUsuario().getIdUsuario(),
                reserva.getInstalacion().getId()
        );
    }

}
