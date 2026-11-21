package com.sbe.backend.config;

import com.sbe.backend.instalacion.entity.Instalacion;
import com.sbe.backend.instalacion.repository.InstalacionRepository;
import com.sbe.backend.reserva.entity.EstadoReserva;
import com.sbe.backend.reserva.entity.Reserva;
import com.sbe.backend.reserva.repository.ReservaRepository;
import com.sbe.backend.usuario.entity.Categoria;
import com.sbe.backend.usuario.entity.Rol;
import com.sbe.backend.usuario.entity.Usuario;
import com.sbe.backend.usuario.repository.CategoriaRepository;
import com.sbe.backend.usuario.repository.RolRepository;
import com.sbe.backend.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final CategoriaRepository categoriaRepository;
    private final InstalacionRepository instalacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final ReservaRepository reservaRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.password:Admin1234}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        crearRol("ADMINISTRADOR", "Acceso total al sistema");
        crearRol("EMPLEADO", "Gestiona reservas, pagos y servicios");
        crearRol("USUARIO", "Reserva servicios y paga cuotas");

        // Categorías iniciales
        crearCategoria("SOCIO_INTERNO", "DOCENTE", new BigDecimal("20.00"), BigDecimal.ZERO,
                new BigDecimal("3000"), new BigDecimal("8500"), new BigDecimal("30000"));
        crearCategoria("SOCIO_INTERNO", "ALUMNO", new BigDecimal("30.00"), BigDecimal.ZERO,
                new BigDecimal("2500"), new BigDecimal("7000"), new BigDecimal("25000"));
        crearCategoria("SOCIO_INTERNO", "NODOCENTE", new BigDecimal("20.00"), BigDecimal.ZERO,
                new BigDecimal("3000"), new BigDecimal("8500"), new BigDecimal("30000"));
        crearCategoria("SOCIO_EXTERNO", "SIN_VINCULO_UNSE", BigDecimal.ZERO, BigDecimal.ZERO,
                new BigDecimal("7000"), new BigDecimal("20000"), new BigDecimal("70000"));
        crearCategoria("NO_SOCIO", "SIN_VINCULO_UNSE", BigDecimal.ZERO, new BigDecimal("15.00"),
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);

        crearAdminInicial();

        // Inicializar instalaciones de prueba
        crearInstalacion("Cancha de Fútbol 5", "Cancha de césped sintético iluminada", "Habilitada", new BigDecimal("8000.00"), 60);
        crearInstalacion("Cancha de Pádel", "Cancha de blindex con iluminación LED", "Habilitada", new BigDecimal("6000.00"), 90);
        crearInstalacion("Quincho Principal", "Quincho con asador para eventos", "Habilitada", new BigDecimal("15000.00"), 240);
        crearInstalacion("Cancha de Básquet", "En mantenimiento de piso parquet", "MANTENIMIENTO", new BigDecimal("5000.00"), 60);

        // Inicializar lote de usuarios de prueba (socios y no socios, mínimo 23)
        crearUsuariosLotePrueba();
    }

    private void crearRol(String nombre, String descripcion) {
        if (!rolRepository.existsByNombreRol(nombre)) {
            Rol rol = new Rol();
            rol.setNombreRol(nombre);
            rol.setDesc(descripcion);
            rolRepository.save(rol);
        }
    }

    private void crearAdminInicial() {
        String dni = "11111111";
        if (usuarioRepository.existsByDni(dni)) {
            return;
        }

        Rol rolAdmin = rolRepository.findByNombreRol("ADMINISTRADOR")
                .orElseThrow(() -> new IllegalStateException("Falta el rol ADMINISTRADOR"));
        Categoria categoria = categoriaRepository.findByTipoSocioAndVinculoUnse("NO_SOCIO", "SIN_VINCULO_UNSE")
                .orElseThrow(() -> new IllegalStateException("Falta la categoría NO_SOCIO"));

        Usuario admin = Usuario.builder()
                .dni(dni)
                .nombreCompleto("Administrador del Sistema")
                .email("admin@sbe.unse.edu.ar")
                .fechaNacimiento(LocalDateTime.of(1990, 1, 1, 0, 0))
                .domicilio("UNSE - Santiago del Estero")
                .passwordHash(passwordEncoder.encode(adminPassword))
                .estado(Usuario.EstadoUsuario.ACTIVO)
                .rol(rolAdmin)
                .categoria(categoria)
                .build();

        usuarioRepository.save(admin);
    }

    private void crearCategoria(String tipoSocio, String vinculoUnse, BigDecimal descuento,
                                BigDecimal recargo, BigDecimal mensual, BigDecimal trimestral,
                                BigDecimal anual) {
        categoriaRepository.findByTipoSocioAndVinculoUnse(tipoSocio, vinculoUnse)
                .ifPresentOrElse(
                        c -> {
                            c.setDescuento(descuento);
                            c.setRecargo(recargo);
                            c.setCuotaMensual(mensual);
                            c.setCuotaTrimestral(trimestral);
                            c.setCuotaAnual(anual);
                            categoriaRepository.save(c);
                        },
                        () -> {
                            Categoria c = new Categoria();
                            c.setTipoSocio(tipoSocio);
                            c.setVinculoUnse(vinculoUnse);
                            c.setDescuento(descuento);
                            c.setRecargo(recargo);
                            c.setCuotaMensual(mensual);
                            c.setCuotaTrimestral(trimestral);
                            c.setCuotaAnual(anual);
                            categoriaRepository.save(c);
                        }
                );
    }

    private void crearInstalacion(String nombre, String descripcion, String estado, BigDecimal precioBase, Integer duracionMinutos) {
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

    private Usuario crearUsuarioSiNoExiste(
            String dni,
            String nombreCompleto,
            String email,
            LocalDateTime fechaNacimiento,
            String domicilio,
            String password,
            Usuario.EstadoUsuario estado,
            Integer puntosAc,
            String rolNombre,
            String tipoSocio,
            String vinculoUnse,
            LocalDate fechaAltaSocio
    ) {
        return usuarioRepository.findByDni(dni).orElseGet(() -> {
            Rol rol = rolRepository.findByNombreRol(rolNombre)
                    .orElseThrow(() -> new IllegalStateException("Falta rol: " + rolNombre));
            Categoria categoria = categoriaRepository.findByTipoSocioAndVinculoUnse(tipoSocio, vinculoUnse)
                    .orElseThrow(() -> new IllegalStateException("Falta categoría: " + tipoSocio + " " + vinculoUnse));

            Usuario u = Usuario.builder()
                    .dni(dni)
                    .nombreCompleto(nombreCompleto)
                    .email(email)
                    .fechaNacimiento(fechaNacimiento)
                    .domicilio(domicilio)
                    .passwordHash(passwordEncoder.encode(password))
                    .estado(estado)
                    .puntosAc(puntosAc != null ? puntosAc : 0)
                    .rol(rol)
                    .categoria(categoria)
                    .fechaAltaSocio(fechaAltaSocio)
                    .build();

            return usuarioRepository.save(u);
        });
    }

    private void crearReservaSiNoExiste(
            Usuario usuario,
            String nombreInstalacion,
            LocalDate fechaReserva,
            LocalTime inicio,
            LocalTime fin,
            EstadoReserva estado,
            BigDecimal monto
    ) {
        boolean existe = reservaRepository.findAll().stream().anyMatch(r ->
                r.getUsuario().getIdUsuario().equals(usuario.getIdUsuario())
                        && r.getFechaReserva().equals(fechaReserva)
                        && r.getHorarioInicio().equals(inicio)
        );

        if (!existe) {
            Instalacion instalacion = instalacionRepository.findAll().stream()
                    .filter(i -> i.getNombre().equalsIgnoreCase(nombreInstalacion))
                    .findFirst()
                    .orElse(null);

            if (instalacion != null) {
                Reserva r = Reserva.builder()
                        .usuario(usuario)
                        .instalacion(instalacion)
                        .fechaReserva(fechaReserva)
                        .horarioInicio(inicio)
                        .horarioFin(fin)
                        .estado(estado)
                        .monto(monto != null ? monto : instalacion.getPrecioBase())
                        .build();
                reservaRepository.save(r);
            }
        }
    }

    private void crearUsuariosLotePrueba() {
        String defaultPass = "Usuario123!";

        // 1. SOCIOS INTERNOS - ALUMNOS (7 usuarios)
        Usuario u1 = crearUsuarioSiNoExiste("38101001", "Lucas Benítez", "lucas.benitez@alumno.unse.edu.ar",
                LocalDateTime.of(2001, 3, 15, 0, 0), "Belgrano 123, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 120, "USUARIO", "SOCIO_INTERNO", "ALUMNO", LocalDate.of(2023, 3, 10));

        Usuario u2 = crearUsuarioSiNoExiste("39202002", "Sofía Gómez", "sofia.gomez@alumno.unse.edu.ar",
                LocalDateTime.of(2002, 7, 22, 0, 0), "Rivadavia 456, La Banda", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 50, "USUARIO", "SOCIO_INTERNO", "ALUMNO", LocalDate.of(2023, 4, 15));

        crearUsuarioSiNoExiste("40303003", "Mateo Rodríguez", "mateo.rodriguez@alumno.unse.edu.ar",
                LocalDateTime.of(2003, 1, 9, 0, 0), "Mitre 789, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 210, "USUARIO", "SOCIO_INTERNO", "ALUMNO", LocalDate.of(2023, 8, 20));

        crearUsuarioSiNoExiste("41404004", "Valentina Herrera", "valentina.herrera@alumno.unse.edu.ar",
                LocalDateTime.of(2004, 11, 30, 0, 0), "Libertad 321, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 80, "USUARIO", "SOCIO_INTERNO", "ALUMNO", LocalDate.of(2024, 2, 1));

        crearUsuarioSiNoExiste("42505005", "Agustín Morales", "agustin.morales@alumno.unse.edu.ar",
                LocalDateTime.of(2004, 5, 14, 0, 0), "España 654, La Banda", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 15, "USUARIO", "SOCIO_INTERNO", "ALUMNO", LocalDate.of(2024, 3, 12));

        crearUsuarioSiNoExiste("43606006", "Camila Díaz", "camila.diaz@alumno.unse.edu.ar",
                LocalDateTime.of(2005, 9, 18, 0, 0), "Sarmiento 987, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 95, "USUARIO", "SOCIO_INTERNO", "ALUMNO", LocalDate.of(2024, 4, 5));

        crearUsuarioSiNoExiste("44707007", "Joaquín Pereyra", "joaquin.pereyra@alumno.unse.edu.ar",
                LocalDateTime.of(2005, 12, 3, 0, 0), "Alsina 159, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 30, "USUARIO", "SOCIO_INTERNO", "ALUMNO", LocalDate.of(2024, 5, 20));

        // 2. SOCIOS INTERNOS - DOCENTES (4 usuarios)
        Usuario u8 = crearUsuarioSiNoExiste("28808008", "Carlos Fernández", "carlos.fernandez@docente.unse.edu.ar",
                LocalDateTime.of(1980, 4, 25, 0, 0), "Av. Roca 750, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 350, "USUARIO", "SOCIO_INTERNO", "DOCENTE", LocalDate.of(2022, 2, 10));

        crearUsuarioSiNoExiste("29909009", "Mariana Navarro", "mariana.navarro@docente.unse.edu.ar",
                LocalDateTime.of(1982, 8, 14, 0, 0), "San Martín 1120, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 180, "USUARIO", "SOCIO_INTERNO", "DOCENTE", LocalDate.of(2022, 5, 18));

        crearUsuarioSiNoExiste("27010110", "Roberto Paz", "roberto.paz@docente.unse.edu.ar",
                LocalDateTime.of(1978, 10, 5, 0, 0), "24 de Septiembre 300, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 260, "USUARIO", "SOCIO_INTERNO", "DOCENTE", LocalDate.of(2021, 11, 1));

        crearUsuarioSiNoExiste("30121211", "Silvia Coronel", "silvia.coronel@docente.unse.edu.ar",
                LocalDateTime.of(1983, 2, 28, 0, 0), "Aristóbulo del Valle 400, La Banda", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 140, "USUARIO", "SOCIO_INTERNO", "DOCENTE", LocalDate.of(2023, 1, 15));

        // 3. SOCIOS INTERNOS - NODOCENTES (4 usuarios)
        crearUsuarioSiNoExiste("31232312", "Martín Carrizo", "martin.carrizo@unse.edu.ar",
                LocalDateTime.of(1985, 6, 12, 0, 0), "Independencia 850, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 75, "USUARIO", "SOCIO_INTERNO", "NODOCENTE", LocalDate.of(2023, 6, 1));

        crearUsuarioSiNoExiste("32343413", "Patricia Suárez", "patricia.suarez@unse.edu.ar",
                LocalDateTime.of(1986, 12, 1, 0, 0), "Garibaldi 220, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 110, "USUARIO", "SOCIO_INTERNO", "NODOCENTE", LocalDate.of(2023, 7, 20));

        crearUsuarioSiNoExiste("33454514", "Gonzalo Vega", "gonzalo.vega@unse.edu.ar",
                LocalDateTime.of(1988, 3, 30, 0, 0), "Av. Solís 1400, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 40, "USUARIO", "SOCIO_INTERNO", "NODOCENTE", LocalDate.of(2024, 1, 10));

        crearUsuarioSiNoExiste("22565625", "Jorge Quiroga", "jorge.quiroga@unse.edu.ar",
                LocalDateTime.of(1975, 9, 21, 0, 0), "Moreno 910, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 300, "EMPLEADO", "SOCIO_INTERNO", "NODOCENTE", LocalDate.of(2020, 3, 1));

        // 4. SOCIOS EXTERNOS (4 usuarios)
        Usuario u16 = crearUsuarioSiNoExiste("34565615", "Facundo Santillán", "facundo.santillan@gmail.com",
                LocalDateTime.of(1989, 11, 17, 0, 0), "Urquiza 550, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 160, "USUARIO", "SOCIO_EXTERNO", "SIN_VINCULO_UNSE", LocalDate.of(2023, 9, 1));

        crearUsuarioSiNoExiste("35676716", "Florencia Ledesma", "florencia.ledesma@hotmail.com",
                LocalDateTime.of(1991, 5, 23, 0, 0), "Av. Belgrano Sur 2100, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 90, "USUARIO", "SOCIO_EXTERNO", "SIN_VINCULO_UNSE", LocalDate.of(2023, 10, 15));

        crearUsuarioSiNoExiste("36787817", "Esteban Mansilla", "esteban.mansilla@yahoo.com",
                LocalDateTime.of(1992, 1, 8, 0, 0), "Güemes 340, La Banda", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 220, "USUARIO", "SOCIO_EXTERNO", "SIN_VINCULO_UNSE", LocalDate.of(2024, 2, 20));

        crearUsuarioSiNoExiste("37898918", "Luciana Juárez", "luciana.juarez@gmail.com",
                LocalDateTime.of(1993, 10, 19, 0, 0), "9 de Julio 120, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 45, "USUARIO", "SOCIO_EXTERNO", "SIN_VINCULO_UNSE", LocalDate.of(2024, 3, 1));

        // 5. NO SOCIOS (6 usuarios)
        Usuario u20 = crearUsuarioSiNoExiste("25909019", "Rodrigo Acosta", "rodrigo.acosta@outlook.com",
                LocalDateTime.of(1977, 2, 14, 0, 0), "Salta 600, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 0, "USUARIO", "NO_SOCIO", "SIN_VINCULO_UNSE", null);

        crearUsuarioSiNoExiste("26010120", "Daniela Maidana", "daniela.maidana@gmail.com",
                LocalDateTime.of(1979, 7, 7, 0, 0), "Pellegrini 430, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 0, "USUARIO", "NO_SOCIO", "SIN_VINCULO_UNSE", null);

        crearUsuarioSiNoExiste("38121221", "Nicolás Albarracín", "nicolas.albarracin@gmail.com",
                LocalDateTime.of(1994, 4, 11, 0, 0), "Tucumán 180, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 0, "USUARIO", "NO_SOCIO", "SIN_VINCULO_UNSE", null);

        crearUsuarioSiNoExiste("39232322", "Julieta Olivera", "julieta.olivera@gmail.com",
                LocalDateTime.of(1995, 8, 29, 0, 0), "Catamarca 510, Capital", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 0, "USUARIO", "NO_SOCIO", "SIN_VINCULO_UNSE", null);

        Usuario u24 = crearUsuarioSiNoExiste("40343423", "Tomás Cáceres", "tomas.caceres@gmail.com",
                LocalDateTime.of(1997, 12, 16, 0, 0), "Alberdi 830, La Banda", defaultPass,
                Usuario.EstadoUsuario.ACTIVO, 0, "USUARIO", "NO_SOCIO", "SIN_VINCULO_UNSE", null);

        crearUsuarioSiNoExiste("41454524", "Milagros Sosa", "milagros.sosa@gmail.com",
                LocalDateTime.of(1998, 6, 4, 0, 0), "San Juan 250, Capital", defaultPass,
                Usuario.EstadoUsuario.DE_BAJA, 0, "USUARIO", "NO_SOCIO", "SIN_VINCULO_UNSE", null);

        // Sembrar reservas para varios usuarios con distintos estados y fechas
        // Lucas Benítez (Alumno) -> 3 reservas (1 cancelada, 2 FINALIZADAs)
        crearReservaSiNoExiste(u1, "Cancha de Fútbol 5", LocalDate.of(2026, 11, 10), LocalTime.of(18, 0), LocalTime.of(19, 0), EstadoReserva.FINALIZADA, new BigDecimal("5600.00"));
        crearReservaSiNoExiste(u1, "Cancha de Pádel", LocalDate.of(2026, 11, 15), LocalTime.of(19, 0), LocalTime.of(20, 30), EstadoReserva.CANCELADA, new BigDecimal("4200.00"));
        crearReservaSiNoExiste(u1, "Quincho Principal", LocalDate.of(2026, 11, 20), LocalTime.of(20, 0), LocalTime.of(23, 59), EstadoReserva.RESERVADA, new BigDecimal("10500.00"));

        // Sofía Gómez (Alumno) -> 2 reservas
        crearReservaSiNoExiste(u2, "Cancha de Pádel", LocalDate.of(2026, 11, 12), LocalTime.of(17, 30), LocalTime.of(19, 0), EstadoReserva.RESERVADA, new BigDecimal("4200.00"));
        crearReservaSiNoExiste(u2, "Cancha de Fútbol 5", LocalDate.of(2026, 11, 18), LocalTime.of(20, 0), LocalTime.of(21, 0), EstadoReserva.FINALIZADA, new BigDecimal("5600.00"));

        // Carlos Fernández (Docente) -> 3 reservas (1 reprogramada)
        crearReservaSiNoExiste(u8, "Quincho Principal", LocalDate.of(2026, 11, 5), LocalTime.of(12, 0), LocalTime.of(16, 0), EstadoReserva.FINALIZADA, new BigDecimal("12000.00"));
        crearReservaSiNoExiste(u8, "Cancha de Pádel", LocalDate.of(2026, 11, 14), LocalTime.of(18, 0), LocalTime.of(19, 30), EstadoReserva.REPROGRAMADA, new BigDecimal("4800.00"));
        crearReservaSiNoExiste(u8, "Cancha de Fútbol 5", LocalDate.of(2026, 11, 22), LocalTime.of(19, 0), LocalTime.of(20, 0), EstadoReserva.RESERVADA, new BigDecimal("6400.00"));

        // Facundo Santillán (Socio Externo) -> 2 reservas (1 cancelada)
        crearReservaSiNoExiste(u16, "Cancha de Fútbol 5", LocalDate.of(2026, 11, 8), LocalTime.of(21, 0), LocalTime.of(22, 0), EstadoReserva.CANCELADA, new BigDecimal("8000.00"));
        crearReservaSiNoExiste(u16, "Cancha de Pádel", LocalDate.of(2026, 11, 16), LocalTime.of(20, 0), LocalTime.of(21, 30), EstadoReserva.FINALIZADA, new BigDecimal("6000.00"));

        // Rodrigo Acosta (No Socio con recargo 15%) -> 2 reservas
        crearReservaSiNoExiste(u20, "Cancha de Fútbol 5", LocalDate.of(2026, 11, 11), LocalTime.of(19, 0), LocalTime.of(20, 0), EstadoReserva.FINALIZADA, new BigDecimal("9200.00"));
        crearReservaSiNoExiste(u20, "Quincho Principal", LocalDate.of(2026, 11, 25), LocalTime.of(21, 0), LocalTime.of(23, 59), EstadoReserva.RESERVADA, new BigDecimal("17250.00"));

        // Tomás Cáceres (No Socio) -> 1 reserva cancelada
        crearReservaSiNoExiste(u24, "Cancha de Pádel", LocalDate.of(2026, 11, 9), LocalTime.of(16, 0), LocalTime.of(17, 30), EstadoReserva.CANCELADA, new BigDecimal("6900.00"));
    }
}
