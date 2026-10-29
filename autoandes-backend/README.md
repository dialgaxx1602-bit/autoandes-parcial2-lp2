# AutoAndes Backend REST API

Backend empresarial para el sistema de órdenes de servicio del taller mecánico AutoAndes desarrollado con Spring Boot 4, Oracle Database y Spring Security con JWT.

## Requisitos y Tecnologías
- **Java**: OpenJDK 21 LTS
- **Framework**: Spring Boot 4.0.7
- **Base de Datos**: Oracle Database (FREEPDB1)
- **Migraciones**: Flyway
- **Seguridad**: Spring Security con JWT (JJWT 0.12.6) y BCrypt
- **Documentación**: SpringDoc OpenAPI 3 / Swagger UI

## Instrucciones de Ejecución

1. Asegurarse de que el contenedor de Oracle Database esté activo en el puerto `1522` (o `1521`):
   ```bash
   docker start oracle-local
   ```
2. Ejecutar el backend mediante Maven Wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
3. La aplicación estará disponible en `http://localhost:8080/`
4. Documentación interactiva de Swagger UI:
   `http://localhost:8080/swagger-ui.html`

## Usuarios y Credenciales de Prueba

| Usuario | Contraseña | Rol | Permisos Principales |
|---|---|---|---|
| `admin` | `Auto2026*` | `ADMIN` | Acceso total a todas las operaciones y reportes |
| `asesor` | `Auto2026*` | `ASESOR` | Registra vehículos y órdenes; consulta catálogos |
| `jefe` | `Auto2026*` | `JEFE_TALLER` | Mantiene catálogo servicios, anula órdenes y consulta reportes |
| `inactivo` | `Auto2026*` | `ASESOR` | Usuario con cuenta inactiva (Prueba 401) |

## Contrato de Endpoints Principales (`/api/v1`)

- **Autenticación**:
  - `POST /api/v1/auth/login` (Público) -> Devuelve Bearer token y permisos
  - `GET /api/v1/auth/me` (Autenticado)
- **Servicios**:
  - `GET /api/v1/servicios` (Permiso: `SERVICIO_LEER`)
  - `POST /api/v1/servicios` (Permiso: `SERVICIO_ESCRIBIR`)
  - `PUT /api/v1/servicios/{id}` (Permiso: `SERVICIO_ESCRIBIR`)
  - `DELETE /api/v1/servicios/{id}` (Permiso: `SERVICIO_ESCRIBIR`)
  - `PATCH /api/v1/servicios/{id}/estado` (Permiso: `SERVICIO_ESCRIBIR`)
- **Vehículos**:
  - `GET /api/v1/vehiculos?clienteId` (Permiso: `VEHICULO_LEER`)
  - `POST /api/v1/vehiculos` (Permiso: `VEHICULO_ESCRIBIR`)
  - `PUT /api/v1/vehiculos/{id}` (Permiso: `VEHICULO_ESCRIBIR`)
  - `DELETE /api/v1/vehiculos/{id}` (Permiso: `VEHICULO_ESCRIBIR`)
- **Órdenes de Servicio**:
  - `POST /api/v1/ordenes` (Permiso: `ORDEN_REGISTRAR`) -> Registro atómico cabecera-detalle
  - `GET /api/v1/ordenes?placa&estado&desde&hasta` (Permiso: `ORDEN_LEER`)
  - `GET /api/v1/ordenes/{id}` (Permiso: `ORDEN_LEER`)
  - `PATCH /api/v1/ordenes/{id}/anular` (Permiso: `ORDEN_ANULAR`)
- **Reportes**:
  - `GET /api/v1/reportes/ingresos-por-servicio` (Permiso: `REPORTE_VER`) -> Consulta JPQL agregada `GROUP BY`
