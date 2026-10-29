# AutoAndes Web (Frontend SPA)

Frontend empresarial seguro para el sistema de órdenes de servicio del taller mecánico AutoAndes desarrollado en Angular 22 con componentes Standalone y Signals.

## Requisitos y Tecnologías
- **Node.js**: v24 LTS
- **Angular**: 22.2.0 Standalone
- **Estilos**: Pure CSS / Modern UI Responsive
- **Seguridad**: Interceptores JWT y HTTP Error, Guards (Auth, Invitado, Permisos) y almacenamiento seguro en `sessionStorage`

## Instrucciones de Ejecución

1. Instalar dependencias (si no se realizó previamente):
   ```bash
   npm install
   ```
2. Iniciar el servidor de desarrollo:
   ```bash
   npm start
   ```
   o
   ```bash
   ng serve
   ```
3. Abrir en el navegador:
   `http://localhost:4200/`

## Características Implementadas

- **Autenticación y Sesión**:
  - Login desacoplado del layout principal con manejo uniforme de errores 401.
  - Almacenamiento seguro de token y expiración en `sessionStorage` (evitando persistencia no deseada en computadoras compartidas).
  - Cierre automático de sesión reactivo cuando el token expira.
- **Seguridad por Permisos**:
  - `authGuard`: Protege rutas del layout.
  - `invitadoGuard`: Evita acceder al login si ya existe sesión activa.
  - `permisoGuard`: Valida el permiso requerido en `data.permiso` y redirige a `/acceso-denegado` (403) sin cerrar la sesión activa.
  - Menú lateral y botones filtrados reactivamente con Signals según los permisos del usuario logueado.
- **CRUD de Servicios**:
  - Buscador reactivo, formulario único para alta/edición, dar de baja lógica (`PATCH /servicios/{id}/estado`), y captura de errores 400 y 409 del backend.
- **CRUD de Vehículos**:
  - Lista desplegable de clientes obtenida del backend, validación de placas (`ABC-123`) y filtro por cliente propietario.
- **Órdenes de Servicio**:
  - Formulario dinámico cabecera-detalle con recálculo automático de subtotales y total estimado.
  - Validación atómica: si el backend rechaza una regla (ej. 409 kilometraje menor o servicio inactivo), no se pierden las líneas capturadas.
  - Consulta con filtros combinados (placa, estado, fecha desde/hasta), visor de detalles y anulación con diálogo de motivo (10 a 200 caracteres).
- **Reporte de Ingresos**:
  - Visualización del resumen de ingresos agregados por servicio excluyendo órdenes anuladas (solo accesible para usuarios con permiso `REPORTE_VER`).
