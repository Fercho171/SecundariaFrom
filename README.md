# Asistencia escolar — Frontend

Aplicación web / PWA para el pase de lista diario en una escuela secundaria. Está pensada para tabletas: botones grandes, navegación corta y una interfaz clara para docentes.

Tecnología: Angular 21, TypeScript, Angular Material, RxJS, SCSS y Service Worker.

## Requisitos

- Node.js 22 o superior
- npm 10 o superior

## Instalación

```bash
npm install
```

## Ejecución en desarrollo

```bash
npm start
```

La aplicación queda en [http://localhost:4200](http://localhost:4200).

Acceso de demostración:

- Usuario: `admin`
- Contraseña: `admin`

El entorno de desarrollo usa una API simulada (`useMockApi: true`), así que el sistema funciona sin backend.

## Compilación

```bash
npm run build
```

La salida queda en `dist/asistencia-escolar/browser`.

Para probar la PWA (instalación y service worker) sirve esa carpeta con un servidor HTTP, por ejemplo:

```bash
npx http-server dist/asistencia-escolar/browser -p 8081
```

## Conexión con Spring Boot

1. En `src/environments/environment.ts` y `src/environments/environment.development.ts` configura:

```ts
apiUrl: 'http://localhost:8080/api',
useMockApi: false
```

2. El archivo `proxy.conf.json` reenvía `/api` al backend en el puerto 8080 durante `ng serve`.

3. Endpoints esperados:

- `POST /api/auth/login`
- `GET /api/students`
- `GET /api/students/{id}`
- `GET /api/groups`
- `GET /api/groups/{id}`
- `GET /api/groups/{id}/students`
- `POST /api/attendance`
- `GET /api/attendance`
- `GET /api/attendance/student/{studentId}`
- `GET /api/attendance/group/{groupId}`
- `PUT /api/attendance/{id}`
- `POST /api/justifications`
- `GET /api/justifications`
- `GET /api/dashboard`
- `GET /api/alerts`
- `GET /api/reports/attendance`
- `GET /api/reports/attendance/excel`
- `GET /api/reports/attendance/pdf`

## Flujo principal

Login → Seleccionar grupo → Pasar lista → Confirmar → Guardar → Resultado

## Módulos

- Login y sesión (token en `sessionStorage`, sin guardar contraseñas)
- Tablero
- Grupos y alumnos
- Pase de lista
- Horario de clases
- Horario por profesores
- Faltantes de profesores por día
- Horas de trabajo docentes
- Historial
- Justificaciones
- Reportes (Excel y PDF vía backend)
- Alumnos en seguimiento

## Offline

Esta versión deja lista la arquitectura (`ConnectivityService` y `OfflineQueueService`). Si no hay red al guardar asistencia, el registro se encola localmente para una sincronización posterior.
