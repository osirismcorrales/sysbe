package com.sbe.backend.horario.service;

import com.sbe.backend.horario.dto.BloqueDto;
import com.sbe.backend.horario.entity.DiaSemana;
import com.sbe.backend.horario.entity.PlantillaHorario;
import com.sbe.backend.horario.repository.PlantillaHorarioRepository;
import com.sbe.backend.instalacion.entity.Instalacion;
import com.sbe.backend.instalacion.repository.InstalacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class DisponibilidadService {


    private final InstalacionRepository instalacionRepository;
    private final PlantillaHorarioRepository plantillaRepository;

  //
}