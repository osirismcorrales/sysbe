# 📖 Manual de Configuración y Ejecución del Sistema SYSBE

Este manual detalla paso a paso cómo configurar, inicializar y ejecutar todos los componentes del sistema **SYSBE** desde cero en un entorno local de desarrollo.

El proyecto está compuesto por tres módulos principales:
1. **Backend** (`backend`): API REST con Spring Boot, Spring Security (JWT) y PostgreSQL.
2. **Dashboard Web** (`sbe-dashboard`): Panel de administración web para empleados y administradores (React + Vite).
3. **App Móvil** (`sbe-app`): Aplicación móvil para socios y usuarios finales (React Native + Expo).

---

## 🛠️ 1. Requisitos Previos

Asegúrate de tener instaladas las siguientes herramientas en tu computadora:

- **Java JDK 17 o 21**: Verificar con `java -version`.
- **Node.js (v18 o v20 LTS recomendado)** y **npm**: Verificar con `node -v` y `npm -v`.
- **PostgreSQL (v14 o superior)**: Debe estar instalado y con el servicio iniciado.
- **Git**: Para control de versiones.
- **Expo Go (Opcional, en tu celular Android o iOS)**: Para probar la app móvil física escaneando el código QR, o un **Emulador de Android Studio**.

---

## 🗄️ 2. Configuración de la Base de Datos (PostgreSQL)

1. Abre tu gestor de base de datos preferido (**pgAdmin 4**, **DBeaver** o la consola **psql**).
2. Conéctate a tu servidor local de PostgreSQL (usualmente puerto `5432`).
3. Crea una base de datos llamada `sbe_db`:
   ```sql
   CREATE DATABASE sbe_db;
   ```
4. El backend creará automáticamente todas las tablas, relaciones y datos iniciales en el primer arranque gracias a Hibernate (`ddl-auto=update`) y `DataInitializer`.

---

## ☕ 3. Configuración y Ejecución del Backend

El backend se encuentra en la carpeta `backend/`.

### 3.1. Configuración de Credenciales
Revisa el archivo de configuración de desarrollo en:
📁 [application-dev.properties](file:///c:/Users/mispa/OneDrive/Documentos/Trabajos/sysbe/backend/src/main/resources/application-dev.properties)

Verifica que coincida con tu usuario y contraseña local de PostgreSQL:
```properties
server.port=8080

spring.datasource.url=jdbc:postgresql://localhost:5432/sbe_db
spring.datasource.username=postgres
spring.datasource.password=1234
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
```
> 💡 *Si tu contraseña de PostgreSQL no es `1234`, cámbiala en `spring.datasource.password` por la tuya.*

### 3.2. Ejecutar el Backend

Abre una terminal en la carpeta `backend` y ejecuta:

**En Windows (PowerShell / CMD):**
```powershell
cd c:\Users\mispa\OneDrive\Documentos\Trabajos\sysbe\backend
.\mvnw.cmd spring-boot:run
```

**O si tienes Maven instalado globalmente:**
```bash
mvn spring-boot:run
```

### 3.3. Verificación del Backend
Una vez levantado (verás `Started BackendApplication in X seconds`):
- **API Base:** `http://localhost:8080/api`
- **Documentación Swagger UI:** Abre en tu navegador [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) para explorar y probar todos los endpoints.

### 3.4. Usuario Administrador por Defecto
El sistema precarga automáticamente el siguiente usuario administrador en el primer arranque:
- **DNI:** `11111111`
- **Contraseña:** `Admin1234`
- **Rol:** `ADMINISTRADOR`

---

## 💻 4. Configuración y Ejecución del Dashboard Web (`sbe-dashboard`)

El panel de administración web está diseñado para gestionar socios, empleados, categorías, instalaciones y reservas.

### 4.1. Instalación de Dependencias
Abre una **segunda terminal** y navega a la carpeta del dashboard:
```powershell
cd c:\Users\mispa\OneDrive\Documentos\Trabajos\sysbe\sbe-dashboard
npm install
```

### 4.2. Configuración de API
Por defecto, el dashboard se conecta a:
`http://localhost:8080/api` (definido en [apiClient.ts](file:///c:/Users/mispa/OneDrive/Documentos/Trabajos/sysbe/sbe-dashboard/src/lib/apiClient.ts)).

### 4.3. Iniciar el Servidor de Desarrollo
```powershell
npm run dev
```

El dashboard estará disponible en:
👉 **[http://localhost:5173/sbe-dashboard/](http://localhost:5173/sbe-dashboard/)** (o el puerto indicado por Vite en la consola).

Inicia sesión con las credenciales de administrador:
- **DNI:** `11111111`
- **Contraseña:** `Admin1234`

---

## 📱 5. Configuración y Ejecución de la App Móvil (`sbe-app`)

La app móvil requiere conectarse al backend a través de la red local (LAN / Wi-Fi) para que los dispositivos físicos o emuladores puedan comunicarse con tu computadora.

### 5.1. Conocer tu Dirección IP Local
En Windows, abre una terminal y escribe:
```powershell
ipconfig
```
Busca tu adaptador de Wi-Fi o Ethernet y copia la **Dirección IPv4** (por ejemplo: `192.168.1.15` o `192.168.0.50`).

### 5.2. Configurar la URL de la API
1. Dirígete a la carpeta `sbe-app/`.
2. Edita o crea el archivo `.env` en la raíz de `sbe-app/`:
   ```env
   EXPO_PUBLIC_API_URL=http://<TU_IP_LOCAL>:8080/api
   ```
   *Ejemplo:* `EXPO_PUBLIC_API_URL=http://192.168.1.15:8080/api`

> ⚙️ **Configuración dinámica en la App:**
> En la pantalla de Login de la app móvil dispones de un botón de engranaje (⚙️) en la esquina superior derecha donde puedes ingresar directamente la IP de tu PC sin necesidad de recompilar.

### 5.3. Instalación de Dependencias y Ejecución
Abre una **tercera terminal**:
```powershell
cd c:\Users\mispa\OneDrive\Documentos\Trabajos\sysbe\sbe-app
npm install
npx expo start
```

### 5.4. Probar la Aplicación:
- **En tu celular con Expo Go:**
  1. Conecta tu teléfono a la **misma red Wi-Fi** que tu computadora.
  2. Abre la app **Expo Go** y escanea el código QR que muestra la terminal.
- **En Emulador Android:**
  - Presiona la tecla `a` en la terminal de Expo para abrirlo en el emulador en ejecución.
  - *Nota:* Si usas emulador estándar de Android Studio, la IP especial para el localhost de tu PC es `http://10.0.2.2:8080/api`.

---

## 🚀 6. Resumen de Ejecución Rápida (Día a Día)

Para el trabajo diario, abre 3 terminales en paralelo:

| Terminal | Directorio | Comando | URL / Puerto |
|---|---|---|---|
| **1. Backend** | `sysbe/backend` | `.\mvnw.cmd spring-boot:run` | `http://localhost:8080` (Swagger: `/swagger-ui.html`) |
| **2. Dashboard Web** | `sysbe/sbe-dashboard` | `npm run dev` | `http://localhost:5173/sbe-dashboard/` |
| **3. App Móvil** | `sysbe/sbe-app` | `npx expo start` | Metro Bundler: `http://localhost:8081` |

---

## 🔍 7. Preguntas Frecuentes y Solución de Problemas

### ❌ Error: `Connection refused` o la app móvil no conecta con el backend
1. Verifica que tu celular y tu PC estén conectados a la **misma red Wi-Fi**.
2. Verifica que el Firewall de Windows permita el tráfico entrante en el puerto `8080`:
   - Puedes permitir temporalmente Java o el puerto 8080 en el Firewall de Windows Defender.
3. Prueba acceder desde el navegador de tu celular a:
   `http://<TU_IP_LOCAL>:8080/swagger-ui.html`. Si abre en el celular, la app se conectará sin problemas.

### ❌ Error: `Password authentication failed for user "postgres"`
- Abre `application-dev.properties` en `backend/src/main/resources/` y corrige `spring.datasource.password` con tu contraseña real de PostgreSQL.

### ❌ Error al registrarse o loguearse por primera vez
- Para probar el rol de socio/usuario, puedes registrarte desde la app móvil con la opción *"Registrarse"* o crear un usuario desde el panel del Dashboard Web con el admin (`11111111` / `Admin1234`).
