# SBE Backend

Backend del sistema de reservas del club, desarrollado con **Spring Boot 4 + Java 21 + PostgreSQL**.

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| Spring Boot 4 | Framework principal |
| Spring Data JPA + Hibernate | Acceso a datos / ORM |
| Spring Security | Autenticación y autorización |
| Spring Validation | Validación de DTOs |
| PostgreSQL | Base de datos relacional |
| Lombok | Reducción de boilerplate |
| SpringDoc OpenAPI 3 | Documentación Swagger UI |

---

## 🚀 Cómo levantar el proyecto

### Requisitos previos
- Java 21+
- Maven 3.9+
- PostgreSQL corriendo localmente

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repo>
   cd sbe-backend
   ```

2. **Configurar base de datos**  
   Crear la DB en PostgreSQL:
   ```sql
   CREATE DATABASE sbe_db;
   ```

3. **Configurar credenciales**  
   Copiar el archivo de ejemplo y completar con tus datos locales:
   ```bash
   # El archivo application-dev.properties ya existe con valores de ejemplo
   # Solo editar los valores de usuario y contraseña de Postgres
   ```
   > ⚠️ **NUNCA subir contraseñas reales al repositorio.**

4. **Ejecutar la aplicación**
   ```bash
   ./mvnw spring-boot:run
   ```
   O desde el IDE: ejecutar `BackendApplication.java`

5. **Acceder a Swagger UI**  
   http://localhost:8080/swagger-ui.html

---

## 📁 Estructura del proyecto

```
src/main/java/com/sbe/backend/
│
├── BackendApplication.java       ← Punto de entrada de la app
│
├── config/
│   ├── AppConfig.java            ← Beans globales (PasswordEncoder, etc.)
│   └── GlobalExceptionHandler.java ← Manejo global de errores HTTP
│
├── security/
│   └── SecurityConfig.java       ← Configuración de Spring Security / JWT
│
├── usuario/                      ← Feature: gestión de usuarios del sistema
│   ├── controller/               ← Endpoints REST
│   ├── dto/                      ← Objetos de transferencia (Request/Response)
│   ├── entity/                   ← Entidades JPA (tablas de la DB)
│   ├── mapper/                   ← Conversión entre entity ↔ DTO
│   ├── repository/               ← Acceso a datos (Spring Data JPA)
│   └── service/                  ← Lógica de negocio (interfaz + impl)
│
├── instalacion/                  ← Feature: canchas, pileta, salones
├── socio/                        ← Feature: miembros del club
├── reserva/                      ← Feature: reservas de instalaciones
├── pago/                         ← Feature: pagos de reservas
└── reporte/                      ← Feature: estadísticas y reportes
```

---

## 🏗️ Arquitectura por capas

Cada feature sigue el mismo patrón de capas:

```
HTTP Request
     │
     ▼
┌─────────────┐
│  Controller │  ← Recibe requests, delega al service, devuelve ResponseEntity
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Service   │  ← Lógica de negocio. Valida reglas, orquesta, transforma datos
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Repository  │  ← Solo acceso a datos. Sin lógica de negocio.
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     DB      │  ← PostgreSQL
└─────────────┘
```

**Regla de oro:** cada capa solo conoce a la capa inmediatamente inferior.  
❌ El Controller NO llama directamente al Repository.  
❌ El Service NO tiene anotaciones de HTTP (`@RequestMapping`, etc.).

---

## 📐 Convenciones de código

### Nomenclatura de archivos

| Tipo | Ejemplo |
|---|---|
| Entidad JPA | `Reserva.java` |
| DTO de entrada | `ReservaRequestDto.java` |
| DTO de salida | `ReservaResponseDto.java` |
| Mapper | `ReservaMapper.java` |
| Repository | `ReservaRepository.java` |
| Interfaz de servicio | `ReservaService.java` |
| Implementación de servicio | `ReservaServiceImpl.java` |
| Controller | `ReservaController.java` |

### Endpoints REST

| Método | URL | Descripción |
|---|---|---|
| `GET` | `/api/recursos` | Listar todos |
| `GET` | `/api/recursos/{id}` | Obtener uno |
| `POST` | `/api/recursos` | Crear |
| `PUT` | `/api/recursos/{id}` | Actualizar completo |
| `PATCH` | `/api/recursos/{id}/accion` | Cambio de estado (ej: confirmar) |
| `DELETE` | `/api/recursos/{id}` | Eliminar / desactivar |

### Códigos HTTP

| Situación | Código |
|---|---|
| Consulta exitosa | `200 OK` |
| Creación exitosa | `201 Created` |
| Operación sin respuesta | `204 No Content` |
| Error de validación | `400 Bad Request` |
| No autenticado | `401 Unauthorized` |
| Sin permisos | `403 Forbidden` |
| Recurso no encontrado | `404 Not Found` |
| Conflicto de estado | `409 Conflict` |

### Reglas generales

- **Entidades**: usar `@Getter`/`@Setter` de Lombok, nunca `@Data` en entidades JPA.
- **DTOs**: usar `record` de Java — inmutables, concisos, sin Lombok.
- **Dinero**: siempre `BigDecimal`, nunca `float`/`double`.
- **Fechas**: usar `LocalDate`/`LocalDateTime` de `java.time`, nunca `java.util.Date`.
- **Validaciones**: poner anotaciones (`@NotBlank`, `@Email`, etc.) en el DTO de request.
- **Excepciones**: lanzar desde el Service; el `GlobalExceptionHandler` las convierte a HTTP.
- **Passwords**: hashear con `BCryptPasswordEncoder` siempre antes de guardar en la DB.
- **Baja de registros**: usar baja lógica (`activo = false`) en vez de `DELETE`.
- **@Transactional**: en todos los métodos del Service que modifiquen datos; `readOnly = true` en consultas.

---

## 🗂️ División de features por integrante

| Feature | Paquete | Responsable |
|---|---|---|
| Usuarios + Security | `usuario`, `security` | Integrante 1 |
| Instalaciones + Socios | `instalacion`, `socio` | Integrante 2 |
| Reservas | `reserva` | Integrante 3 |
| Pagos + Reportes | `pago`, `reporte` | Integrante 4 |

> **Nota:** `config/` es compartido. Coordinar cambios en ese paquete para evitar conflictos.

---

## 📖 Archivos de referencia

Para entender cómo implementar tu feature, leer estos archivos en orden:

1. **Entidad** → [`usuario/entity/Usuario.java`](src/main/java/com/sbe/backend/usuario/entity/Usuario.java)
2. **DTOs** → [`usuario/dto/UsuarioRequestDto.java`](src/main/java/com/sbe/backend/usuario/dto/UsuarioRequestDto.java)
3. **Mapper** → [`usuario/mapper/UsuarioMapper.java`](src/main/java/com/sbe/backend/usuario/mapper/UsuarioMapper.java)
4. **Repository** → [`usuario/repository/UsuarioRepository.java`](src/main/java/com/sbe/backend/usuario/repository/UsuarioRepository.java)
5. **Service** → [`usuario/service/UsuarioServiceImpl.java`](src/main/java/com/sbe/backend/usuario/service/UsuarioServiceImpl.java)
6. **Controller** → [`usuario/controller/UsuarioController.java`](src/main/java/com/sbe/backend/usuario/controller/UsuarioController.java)

Para un ejemplo con relaciones entre entidades (ManyToOne, queries personalizadas):

- [`reserva/entity/Reserva.java`](src/main/java/com/sbe/backend/reserva/entity/Reserva.java) — relaciones `@ManyToOne`
- [`reserva/repository/ReservaRepository.java`](src/main/java/com/sbe/backend/reserva/repository/ReservaRepository.java) — `@Query` con JPQL

---

## 🔄 Flujo de trabajo con Git

```bash
# 1. Siempre trabajar en una rama propia
git checkout -b feature/nombre-feature

# 2. Commits frecuentes con mensajes descriptivos
git commit -m "feat(reserva): agregar validacion de conflicto de horarios"

# 3. Antes de hacer PR, sincronizar con main
git fetch origin
git rebase origin/main

# 4. Crear Pull Request y pedir review
```

### Convención de commits

```
feat(feature): descripción      ← nueva funcionalidad
fix(feature): descripción       ← corrección de bug
refactor(feature): descripción  ← refactor sin cambio funcional
docs: descripción               ← cambios en documentación
chore: descripción              ← cambios de config, dependencias
```
