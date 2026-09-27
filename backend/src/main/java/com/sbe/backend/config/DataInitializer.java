package com.sbe.backend.config;

import com.sbe.backend.instalacion.entity.Instalacion;
import com.sbe.backend.instalacion.repository.InstalacionRepository;
import com.sbe.backend.usuario.entity.Categoria;
import com.sbe.backend.usuario.entity.Rol;
import com.sbe.backend.usuario.repository.CategoriaRepository;
import com.sbe.backend.usuario.repository.RolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final CategoriaRepository categoriaRepository;
    private final InstalacionRepository instalacionRepository;

    @Override
    @Transactional
    public void run(String... args) {
        crearRol("ADMINISTRADOR", "Acceso total al sistema");
        crearRol("EMPLEADO", "Gestiona reservas, pagos y servicios");
        crearRol("USUARIO", "Reserva servicios y paga cuotas");

// Valores de ejemplo: reemplazá por los reales
        crearCategoria("SOCIO_INTERNO", "DOCENTE", new BigDecimal("20.00"),
                new BigDecimal("3000"), new BigDecimal("8500"), new BigDecimal("30000"));
        crearCategoria("SOCIO_INTERNO", "ALUMNO", new BigDecimal("30.00"),
                new BigDecimal("2500"), new BigDecimal("7000"), new BigDecimal("25000"));
        crearCategoria("SOCIO_INTERNO", "NODOCENTE", new BigDecimal("20.00"),
                new BigDecimal("3000"), new BigDecimal("8500"), new BigDecimal("30000"));
        crearCategoria("SOCIO_EXTERNO", "SIN_VINCULO_UNSE", new BigDecimal("0.00"),
                new BigDecimal("7000"), new BigDecimal("20000"), new BigDecimal("70000"));
        crearCategoria("NO_SOCIO", "SIN_VINCULO_UNSE", BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);

        // Inicializar instalaciones de prueba
        crearInstalacion("Cancha de Fútbol 5", "Cancha de césped sintético iluminada", "ACTIVO", new BigDecimal("8000.00"), 60);
        crearInstalacion("Cancha de Pádel", "Cancha de blindex con iluminación LED", "ACTIVO", new BigDecimal("6000.00"), 90);
        crearInstalacion("Quincho Principal", "Quincho con asador para eventos", "ACTIVO", new BigDecimal("15000.00"), 240);
        crearInstalacion("Cancha de Básquet", "En mantenimiento de piso parquet", "MANTENIMIENTO", new BigDecimal("5000.00"), 60);
    }

    private void crearRol(String nombre, String descripcion) {
        if (!rolRepository.existsByNombreRol(nombre)) {
            Rol rol = new Rol();
            rol.setNombreRol(nombre);
            rol.setDesc(descripcion);
            rolRepository.save(rol);
        }
    }

    private void crearCategoria(String tipoSocio, String vinculoUnse, BigDecimal descuento,
                                BigDecimal mensual, BigDecimal trimestral, BigDecimal anual) {
        if (!categoriaRepository.existsByTipoSocioAndVinculoUnse(tipoSocio, vinculoUnse)) {
            Categoria c = new Categoria();
            c.setTipoSocio(tipoSocio);
            c.setVinculoUnse(vinculoUnse);
            c.setDescuento(descuento);
            c.setCuotaMensual(mensual);
            c.setCuotaTrimestral(trimestral);
            c.setCuotaAnual(anual);
            categoriaRepository.save(c);
        }
    }

    private void crearInstalacion(String nombre, String descripcion, String estado, BigDecimal precioBase, Integer duracionMinutos) {
        // En InstalacionRepository puedes agregar el método: boolean existsByNombre(String nombre);
        if (instalacionRepository.findAll().stream().noneMatch(i -> i.getNombre().equalsIgnoreCase(nombre))) {
            Instalacion instalacion = Instalacion.builder()
                    .nombre(nombre)
                    .descripcion(descripcion)
                    .estado(estado)
                    .precioBase(precioBase)
                    .duracionMinutos(duracionMinutos)
                    .build();
            instalacionRepository.save(instalacion);
        }
    }
}