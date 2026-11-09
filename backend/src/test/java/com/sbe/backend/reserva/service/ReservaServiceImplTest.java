package com.sbe.backend.reserva.service;

import com.sbe.backend.instalacion.entity.Instalacion;
import com.sbe.backend.instalacion.repository.InstalacionRepository;
import com.sbe.backend.reserva.dto.ReservaRequestDto;
import com.sbe.backend.reserva.dto.ReservaResponseDto;
import com.sbe.backend.reserva.entity.EstadoReserva;
import com.sbe.backend.reserva.entity.Reserva;
import com.sbe.backend.reserva.mapper.ReservaMapper;
import com.sbe.backend.reserva.repository.ReservaRepository;
import com.sbe.backend.usuario.entity.Categoria;
import com.sbe.backend.usuario.entity.Usuario;
import com.sbe.backend.usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservaServiceImplTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private InstalacionRepository instalacionRepository;

    @Mock
    private ReservaMapper reservaMapper;

    @InjectMocks
    private ReservaServiceImpl reservaService;

    private Usuario usuario;
    private Categoria categoriaInterno;
    private Categoria categoriaNoSocio;
    private Categoria categoriaExterno;
    private Instalacion instalacion;
    private ReservaRequestDto reservaRequestDto;
    private Reserva reservaEntity;
    private Reserva reservaGuardada;
    private ReservaResponseDto reservaResponseDto;

    @BeforeEach
    void setUp() {
        categoriaInterno = Categoria.builder()
                .idCategoria(1)
                .tipoSocio("SOCIO_INTERNO")
                .descuento(BigDecimal.valueOf(20)) // 20% descuento
                .build();

        categoriaNoSocio = Categoria.builder()
                .idCategoria(2)
                .tipoSocio("NO_SOCIO")
                .descuento(BigDecimal.valueOf(50)) // 50% recargo
                .build();

        categoriaExterno = Categoria.builder()
                .idCategoria(3)
                .tipoSocio("SOCIO_EXTERNO")
                .descuento(BigDecimal.ZERO)
                .build();

        usuario = Usuario.builder()
                .idUsuario(1L)
                .dni("12345678")
                .nombreCompleto("Maria Lopez")
                .categoria(categoriaInterno)
                .build();

        instalacion = Instalacion.builder()
                .id(10L)
                .nombre("Cancha de Pádel 1")
                .descripcion("Cancha de césped sintético")
                .estado("DISPONIBLE")
                .precioBase(BigDecimal.valueOf(1000.00))
                .duracionMinutos(60)
                .build();

        LocalDate fechaFutura = LocalDate.now().plusDays(5);
        LocalTime inicio = LocalTime.of(18, 0);
        LocalTime fin = LocalTime.of(19, 0);

        reservaRequestDto = new ReservaRequestDto(
                fechaFutura,
                inicio,
                fin,
                1L,
                10L
        );

        reservaEntity = Reserva.builder()
                .fechaReserva(fechaFutura)
                .horarioInicio(inicio)
                .horarioFin(fin)
                .build();

        reservaGuardada = Reserva.builder()
                .idReserva(100L)
                .fechaReserva(fechaFutura)
                .horarioInicio(inicio)
                .horarioFin(fin)
                .estado(EstadoReserva.RESERVADA)
                .monto(BigDecimal.valueOf(800.00))
                .usuario(usuario)
                .instalacion(instalacion)
                .build();

        reservaResponseDto = new ReservaResponseDto(
                100L,
                fechaFutura,
                inicio,
                fin,
                EstadoReserva.RESERVADA,
                BigDecimal.valueOf(800.00),
                1L,
                10L
        );
    }

    // ==========================================
    // PRUEBAS DE CREACIÓN DE RESERVAS
    // ==========================================

    @Test
    @DisplayName("Debe crear una reserva con descuento para SOCIO_INTERNO exitosamente")
    void crearReserva_Success_WhenSocioInterno() {
        // Arrange (1000 base - 20% = 800)
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(instalacionRepository.findById(10L)).thenReturn(Optional.of(instalacion));
        when(reservaRepository.existeConflictoHorario(
                eq(10L),
                eq(reservaRequestDto.fechaReserva()),
                eq(reservaRequestDto.horarioInicio()),
                eq(reservaRequestDto.horarioFin()),
                any()
        )).thenReturn(false);
        when(reservaMapper.toEntity(reservaRequestDto)).thenReturn(reservaEntity);
        when(reservaRepository.save(any(Reserva.class))).thenReturn(reservaGuardada);
        when(reservaMapper.toResponseDto(reservaGuardada)).thenReturn(reservaResponseDto);

        // Act
        ReservaResponseDto resultado = reservaService.crearReserva(reservaRequestDto);

        // Assert
        assertNotNull(resultado);
        assertEquals(100L, resultado.idReserva());
        assertEquals(EstadoReserva.RESERVADA, resultado.estadoReserva());
        assertEquals(BigDecimal.valueOf(800.00), resultado.montoReserva());
        assertEquals(10L, resultado.idInstalacion());
        assertEquals(1L, resultado.idUsuario());

        verify(usuarioRepository, times(1)).findById(1L);
        verify(instalacionRepository, times(1)).findById(10L);
        verify(reservaRepository, times(1)).save(reservaEntity);
        verify(reservaMapper, times(1)).toResponseDto(reservaGuardada);
    }

    @Test
    @DisplayName("Debe crear una reserva con recargo para NO_SOCIO exitosamente")
    void crearReserva_Success_WhenNoSocio() {
        // Arrange (1000 base + 50% = 1500)
        usuario.setCategoria(categoriaNoSocio);
        Reserva reservaNoSocioGuardada = Reserva.builder()
                .idReserva(101L)
                .fechaReserva(reservaRequestDto.fechaReserva())
                .horarioInicio(reservaRequestDto.horarioInicio())
                .horarioFin(reservaRequestDto.horarioFin())
                .estado(EstadoReserva.RESERVADA)
                .monto(BigDecimal.valueOf(1500.00))
                .usuario(usuario)
                .instalacion(instalacion)
                .build();

        ReservaResponseDto dtoNoSocio = new ReservaResponseDto(
                101L,
                reservaRequestDto.fechaReserva(),
                reservaRequestDto.horarioInicio(),
                reservaRequestDto.horarioFin(),
                EstadoReserva.RESERVADA,
                BigDecimal.valueOf(1500.00),
                1L,
                10L
        );

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(instalacionRepository.findById(10L)).thenReturn(Optional.of(instalacion));
        when(reservaRepository.existeConflictoHorario(any(), any(), any(), any(), any())).thenReturn(false);
        when(reservaMapper.toEntity(reservaRequestDto)).thenReturn(reservaEntity);
        when(reservaRepository.save(any(Reserva.class))).thenReturn(reservaNoSocioGuardada);
        when(reservaMapper.toResponseDto(reservaNoSocioGuardada)).thenReturn(dtoNoSocio);

        // Act
        ReservaResponseDto resultado = reservaService.crearReserva(reservaRequestDto);

        // Assert
        assertNotNull(resultado);
        assertEquals(BigDecimal.valueOf(1500.00), resultado.montoReserva());
        verify(reservaRepository, times(1)).save(reservaEntity);
    }

    @Test
    @DisplayName("Debe crear una reserva con precio base para otros tipos de socios")
    void crearReserva_Success_WhenOtroTipoSocio() {
        // Arrange
        usuario.setCategoria(categoriaExterno);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(instalacionRepository.findById(10L)).thenReturn(Optional.of(instalacion));
        when(reservaRepository.existeConflictoHorario(any(), any(), any(), any(), any())).thenReturn(false);
        when(reservaMapper.toEntity(reservaRequestDto)).thenReturn(reservaEntity);
        when(reservaRepository.save(any(Reserva.class))).thenReturn(reservaGuardada);
        when(reservaMapper.toResponseDto(reservaGuardada)).thenReturn(reservaResponseDto);

        // Act
        ReservaResponseDto resultado = reservaService.crearReserva(reservaRequestDto);

        // Assert
        assertNotNull(resultado);
        verify(reservaRepository, times(1)).save(reservaEntity);
    }

    @Test
    @DisplayName("Debe lanzar ResponseStatusException 404 NOT_FOUND cuando el usuario no existe")
    void crearReserva_ThrowsNotFound_WhenUsuarioNotFound() {
        // Arrange
        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                reservaService.crearReserva(reservaRequestDto)
        );

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertEquals("Usuario no encontrado", ex.getReason());
        verify(usuarioRepository, times(1)).findById(1L);
        verifyNoInteractions(instalacionRepository);
        verifyNoInteractions(reservaRepository);
    }

    @Test
    @DisplayName("Debe lanzar ResponseStatusException 404 NOT_FOUND cuando la instalación no existe")
    void crearReserva_ThrowsNotFound_WhenInstalacionNotFound() {
        // Arrange
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(instalacionRepository.findById(10L)).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                reservaService.crearReserva(reservaRequestDto)
        );

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertEquals("Instalación no encontrada", ex.getReason());
        verify(instalacionRepository, times(1)).findById(10L);
        verifyNoInteractions(reservaRepository);
    }

    @Test
    @DisplayName("Debe lanzar ResponseStatusException 400 BAD_REQUEST cuando la anticipación es menor a 48 horas")
    void crearReserva_ThrowsBadRequest_WhenAnticipacionMenor48Horas() {
        // Arrange: fecha de mañana (menos de 48h)
        ReservaRequestDto dtoMenos48h = new ReservaRequestDto(
                LocalDate.now().plusDays(1),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0),
                1L,
                10L
        );

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(instalacionRepository.findById(10L)).thenReturn(Optional.of(instalacion));

        // Act & Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                reservaService.crearReserva(dtoMenos48h)
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("La reserva debe realizarse con al menos 48 horas de anticipación", ex.getReason());
        verifyNoInteractions(reservaRepository);
    }

    @Test
    @DisplayName("Debe lanzar ResponseStatusException 400 BAD_REQUEST cuando la fecha supera los 2 meses")
    void crearReserva_ThrowsBadRequest_WhenMasDe2MesesAnticipacion() {
        // Arrange: fecha a más de 2 meses
        ReservaRequestDto dtoMas2Meses = new ReservaRequestDto(
                LocalDate.now().plusMonths(2).plusDays(5),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0),
                1L,
                10L
        );

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(instalacionRepository.findById(10L)).thenReturn(Optional.of(instalacion));

        // Act & Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                reservaService.crearReserva(dtoMas2Meses)
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("La reserva no puede realizarse con más de 2 meses de anticipación", ex.getReason());
        verifyNoInteractions(reservaRepository);
    }

    @Test
    @DisplayName("Debe lanzar ResponseStatusException 400 BAD_REQUEST cuando el horario de inicio no es antes del fin")
    void crearReserva_ThrowsBadRequest_WhenHorarioInicioNoEsAntesDeHorarioFin() {
        // Arrange: horario inválido (inicio después o igual a fin)
        ReservaRequestDto dtoHorarioInvalido = new ReservaRequestDto(
                LocalDate.now().plusDays(5),
                LocalTime.of(18, 0),
                LocalTime.of(17, 0),
                1L,
                10L
        );

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(instalacionRepository.findById(10L)).thenReturn(Optional.of(instalacion));

        // Act & Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                reservaService.crearReserva(dtoHorarioInvalido)
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("El horario de inicio debe ser anterior al horario de fin", ex.getReason());
        verifyNoInteractions(reservaRepository);
    }

    @Test
    @DisplayName("Debe lanzar ResponseStatusException 400 BAD_REQUEST cuando la duración no coincide con la instalación")
    void crearReserva_ThrowsBadRequest_WhenDuracionNoCoincide() {
        // Arrange: instalación requiere 60 min, pero se piden 120 min (2 horas)
        ReservaRequestDto dtoDuracionInvalida = new ReservaRequestDto(
                LocalDate.now().plusDays(5),
                LocalTime.of(18, 0),
                LocalTime.of(20, 0),
                1L,
                10L
        );

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(instalacionRepository.findById(10L)).thenReturn(Optional.of(instalacion));

        // Act & Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                reservaService.crearReserva(dtoDuracionInvalida)
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("La duración de la reserva no coincide con la duración de la instalación", ex.getReason());
        verifyNoInteractions(reservaRepository);
    }

    @Test
    @DisplayName("Debe lanzar ResponseStatusException 409 CONFLICT cuando existe conflicto de horario")
    void crearReserva_ThrowsConflict_WhenExisteConflictoHorario() {
        // Arrange
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(instalacionRepository.findById(10L)).thenReturn(Optional.of(instalacion));
        when(reservaRepository.existeConflictoHorario(
                eq(10L),
                eq(reservaRequestDto.fechaReserva()),
                eq(reservaRequestDto.horarioInicio()),
                eq(reservaRequestDto.horarioFin()),
                any()
        )).thenReturn(true);

        // Act & Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                reservaService.crearReserva(reservaRequestDto)
        );

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertEquals("El horario seleccionado no está disponible", ex.getReason());
        verify(reservaRepository, never()).save(any());
    }
}
