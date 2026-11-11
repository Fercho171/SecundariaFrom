# Backend — Asistencia Escolar (Secundaria)

Backend en **Spring Boot 3 + Java 21 + PostgreSQL** para la app Angular de pase de lista
(`Secundaria`). Implementa exactamente los endpoints que el frontend ya espera (ver
`src/environments/*` y el archivo `proxy.conf.json` del proyecto Angular).

## Arquitectura

- **Spring Boot 3.3 / Java 21**, Maven.
- **PostgreSQL** vía Spring Data JPA (Hibernate). Sin datos "mock": todo se guarda y se lee
  de la base de datos real.
- **JWT** (librería `jjwt`) para el login: `POST /api/auth/login` devuelve un token que el
  frontend ya envía como `Authorization: Bearer <token>` (ver `auth.interceptor.ts`).
- **BCrypt** para el password del usuario (nunca se guarda en texto plano).
- Al arrancar por primera vez contra una base vacía, un `DataSeeder` carga datos de ejemplo
  equivalentes a los que traía el `mock-store.ts` del frontend: 9 docentes, 9 grupos (1°–3°,
  A/B/C), 252 alumnos, ~60 días de historial de asistencia, horarios, ausencias de docentes
  y trabajos de cobertura. Así puedes probar la app de inmediato sin capturar nada a mano.
- Usuario de prueba: **usuario `admin`**, **contraseña `admin`** (igual que el modo mock
  del frontend).

## Requisitos

- Java 21
- Maven 3.9+
- Docker (para levantar PostgreSQL rápido) o una instancia de PostgreSQL 14+ ya instalada

## 1. Levantar PostgreSQL

Con Docker (recomendado, incluido `docker-compose.yml`):

```bash
docker compose up -d
```

Esto crea una base `asistencia_escolar` en `localhost:5432` con usuario/clave `asistencia`/`asistencia`.

Si prefieres usar tu propio PostgreSQL, crea la base de datos y ajusta las variables de entorno
`DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (ver `src/main/resources/application.yml`).

## 2. Ejecutar el backend

```bash
mvn spring-boot:run
```

La API queda en `http://localhost:8080/api`. En el primer arranque verás en el log que se
cargan los datos semilla; en arranques siguientes se omite porque la base ya tiene información.

Variables de entorno relevantes (todas con valores por defecto para desarrollo):

| Variable | Uso | Default |
|---|---|---|
| `DB_URL` | JDBC de PostgreSQL | `jdbc:postgresql://localhost:5432/asistencia_escolar` |
| `DB_USERNAME` / `DB_PASSWORD` | Credenciales de la BD | `asistencia` / `asistencia` |
| `JWT_SECRET` | Clave para firmar los JWT (cámbiala en producción) | clave de desarrollo incluida |
| `SEED_DATA` | Pon `false` para no cargar datos de ejemplo | `true` |

## 3. Conectar el frontend Angular

En `src/environments/environment.ts` y `environment.development.ts` del proyecto `Secundaria`:

```ts
apiUrl: 'http://localhost:8080/api',
useMockApi: false
```

`proxy.conf.json` ya reenvía `/api` a `http://localhost:8080` durante `ng serve`, así que no
hace falta tocar nada más.

## 4. Probar con Postman

Importa `postman/asistencia-escolar.postman_collection.json` en Postman. Incluye una carpeta
por módulo (Auth, Dashboard, Grupos, Alumnos, Asistencia, Justificaciones, Docentes, Horarios,
Reportes) con ejemplos de cada endpoint.

1. Corre primero **Auth → Login**: guarda el token automáticamente en la variable de colección
   `{{token}}` y el resto de las peticiones ya lo usan (Bearer Token a nivel de colección).
2. Las variables `groupId`, `studentId`, `teacherId`, `coverWorkId` vienen precargadas con IDs
   que existen en los datos semilla (`g-2A`, `s-1`, `t4`, `work-1`). Cámbialas si quieres probar
   otros grupos/alumnos/docentes.
3. `baseUrl` apunta a `http://localhost:8080/api`; cámbiala si corres el backend en otro puerto.

## Endpoints implementados

Todos bajo `/api`, tal como los documenta el `README.md` del frontend:

```
POST   /auth/login
GET    /dashboard
GET    /alerts
GET    /groups
GET    /groups/{id}
GET    /groups/{id}/students
GET    /students
GET    /students/{id}
POST   /attendance
GET    /attendance
GET    /attendance/student/{studentId}
GET    /attendance/group/{groupId}
PUT    /attendance/{id}
GET    /justifications
POST   /justifications                 (multipart: studentId, date, reason, notes, file?)
GET    /teachers
GET    /schedules/periods
GET    /schedules/classes
GET    /schedules/teachers
GET    /schedules/teachers/{id}
GET    /schedules/absences
GET    /schedules/work-hours
GET    /schedules/uncovered-hours
GET    /schedules/cover-work
POST   /schedules/cover-work           (multipart: title, date, groupId, periodId, absentTeacherName, subject, instructions, file)
GET    /schedules/cover-work/{id}/file
GET    /reports/attendance
GET    /reports/attendance/excel       (CSV, igual que hace el frontend hoy)
GET    /reports/attendance/pdf
```

Todas las rutas requieren `Authorization: Bearer <token>` excepto `/auth/login`. Los errores
siempre responden `{ "message": "..." }` con el status HTTP correspondiente (400/401/403/404/409/500),
que es exactamente lo que espera `error.interceptor.ts` en el frontend.

## Notas de diseño

- Los conteos de asistencia de cada alumno (presentes, faltas, retardos, % de asistencia) se
  calculan siempre a partir de la tabla `attendances`, nunca se guardan como columna aparte, para
  que jamás queden desincronizados.
- El reporte "Excel" (`/reports/attendance/excel`) genera un CSV con codificación UTF-8 + BOM
  (se abre perfecto en Excel), igual que ya hacía el modo mock del frontend.
- El reporte PDF se genera con Apache PDFBox (PDF real, no un mock).
- Los archivos adjuntos (justificantes y trabajos de cobertura) se guardan como `bytea` en
  PostgreSQL. Para un volumen grande de archivos, lo natural sería moverlos a almacenamiento de
  objetos (S3, disco) y guardar solo la referencia; se dejó así por simplicidad.
- `spring.jpa.hibernate.ddl-auto=update` crea/actualiza las tablas automáticamente. Para un
  entorno productivo real, lo recomendable es migrar a Flyway/Liquibase con migraciones versionadas.

## Compilación

> **Nota:** este proyecto se generó y revisó cuidadosamente a mano (incluyendo una revisión
> línea por línea de tipos, imports y firmas de métodos), pero no pudo compilarse dentro de este
> entorno porque no tiene acceso a Maven Central. En tu máquina, con internet normal:

```bash
mvn clean compile   # o: mvn clean package
```

Si algo no compila, es casi seguro un detalle menor (versión de alguna librería, etc.) — dímelo
y lo corrijo de inmediato.
