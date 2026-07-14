# VetCare Frontend — Páginas y formularios conectados al backend real

Fecha: 2026-07-14

## Contexto

`VetCareFrontend` es actualmente el scaffold default de Vite + React 19, sin páginas propias. `SISTEMA_VETERINARIO.md` describe un diseño previo (mock, AuthContext en memoria) que no llegó a implementarse en el código. `VetCareBackend` es un backend .NET 10 real y funcional, con JWT, roles y endpoints ya definidos.

Este spec cubre implementar las páginas de la aplicación (auth + paneles por rol) conectadas directamente a la API real del backend, con estilo visual tomado del mockup aprobado por el usuario (paleta pastel violeta, tipografía Poppins).

## Backend — contrato relevante

- **Base URL**: `http://localhost:5129` (perfil `http` de `launchSettings.json`). CORS abierto (`AllowAnyOrigin`), sin proxy necesario.
- **Auth**: JWT Bearer. `POST /api/auth/signin` y `POST /api/auth/signup` devuelven `{ token, role, userId, email }`. Registro público siempre crea rol `Client`.
- **Roles** (claim string en el JWT): `Client`, `Veterinarian`, `Administrator`, `SysAdmin`.
- **Errores de validación**: `400` con body `{ "error": "Mensaje uno.~Mensaje dos." }` — string único separado por `~`, sin nombre de campo asociado.
- **Endpoints por dominio** (paths reales confirmados, ver nota de rutas no estándar más abajo):
  - Auth: `POST /api/auth/signin`, `/signup`, `/forgost-post` (typo real del backend), `/reset-password`.
  - Cliente (perfil propio): `GET /myuser`, `PUT /myuser/update`, `DELETE /myuser/delete`.
  - Mascotas (Client): `GET /api/client/pet/`, `GET /api/client/pet/{id}`, `POST /api/client/pet/create`, `PUT /api/client/pet/update/{id}`, `DELETE /api/client/pet/delete/{id}`.
  - Razas: `GET /api/breeds?typePet={TypePet}` (auth Client) — devuelve `string[]`, consulta APIs externas de razas.
  - Turnos (Shift): `POST /api/shift/create` (Client), `GET /api/shift/client` (Client), `GET /api/shift/veterinarian` (Veterinarian), `GET /api/shift/admin` (Admins), `PUT /api/shift/status/client/{id}` (cancelar, Client), `PUT /api/shift/status/veterinarian/{id}` (cambiar estado, Veterinarian), `DELETE /api/admins/shift/delete/{id}` (Admins).
  - Veterinarios (gestión, Admins): `POST /api/admins/veterinarian-create`, `GET /api/admins/veterinarian-retrieve/{id}`, `PUT /api/admins/veterinarian-update/{id}`, `DELETE /api/admins/veterinarian-delete/{id}`, `GET /api/admins/veterinarian-retrieves-all`. Perfil propio Veterinarian: `GET/PUT/DELETE /api/veterinarian/myuser`.
  - Administradores: perfil propio `GET/PUT/DELETE /api/admin/myuser`. Gestión por SysAdmin: `POST /api/sysadmin/create`, `GET /api/sysadmin/{Id}`, `PUT /api/sysadmin/update/{Id}`, `DELETE /api/sysadmin/delete/{Id}`, `GET /api/sysadmin/alladmins`.
  - Todos los usuarios combinados (Admins): `GET /api/admins/alluser` → `{ admins, clients, vets }`.
  - Clientes (gestión, Admins): `GET /client/{Id}`, `POST /client/create`, `PUT /client/update/{Id}`, `DELETE /client/delete/{Id}`, `GET /client/all`.

**Nota de rutas no estándar**: varios controllers definen `[Route("api/[controller]")]` en la clase pero cada acción usa `[HttpGet("/algo")]` con `/` inicial, lo que sobrescribe la ruta base. Esto produce una mezcla de rutas con y sin prefijo `api/` (confirmado por inspección de código). Antes de cablear cada llamada, se debe verificar el path exacto contra Swagger (`/swagger`) corriendo el backend localmente, ya que la inspección estática puede no capturar matices de routing de ASP.NET.

## Alcance

Implementar:
1. Infraestructura: cliente API, AuthContext con JWT real, rutas protegidas por rol, layout con sidebar por rol.
2. Páginas públicas de auth: Login, Register, ForgotPassword, ResetPassword — formularios centrados en pantalla completa (patrón `auth-wrap`/`auth-card`).
3. Páginas de Cliente: Mis mascotas (lista), formulario alta/edición de mascota (con select de raza dinámico vía `/api/breeds`), Mis turnos (lista con cancelar), formulario de solicitud de turno, Mi perfil.
4. Páginas de Veterinario: Turnos asignados (lista con cambio de estado), Mi perfil (con matrícula/especialidad).
5. Páginas de Administrador: Todos los usuarios (vista combinada), ABM Clientes, ABM Veterinarios + formulario alta, ABM Turnos global, Mi perfil.
6. Páginas de SysAdmin: ABM Administradores + formulario alta, Mi perfil.

Fuera de alcance (no se implementa en este ciclo): dark mode toggle, animaciones, Radix UI, tests automatizados, paginación de listados, notificaciones toast.

## Stack técnico

- React Router v7 (`createBrowserRouter`) para ruteo.
- Tailwind CSS v4 para estilos, con tokens CSS custom properties calcados de la paleta del mock aprobado (violeta pastel `#A78BFA`/`#8B6FE0`, fondo `#FDF6FB`/`#F6EBFB`, texto `#4A4458`, terracotta `#F5A3B7` para error/destructive, amber `#FBD38D` para pending). Fuente Poppins (Google Fonts) para display y body.
- `lucide-react` para íconos de acciones (editar, eliminar, etc). Sin Radix ni motion — no se usan modales complejos ni animaciones en este alcance; los "modales" de confirmación de borrado se implementan como overlay simple con `useState`.
- Sin librería de formularios (no react-hook-form): estado local por formulario con `useState`, dado el tamaño acotado de cada form.

## Arquitectura de datos y auth

- `src/api/client.js`: wrapper de `fetch` con base URL `http://localhost:5129`, agrega `Authorization: Bearer <token>` desde el token guardado, parsea JSON, y en response `400` extrae `body.error.split("~")` devolviendo un array de mensajes de error listo para mostrar. Otros status (401/403/404/409/500) se propagan como excepción con mensaje genérico apropiado.
- `src/context/AuthContext.jsx`: guarda `{ token, role, userId, email }` en `localStorage` (clave `vetcare_auth`) y en estado de React. Expone `login(email, password)`, `register(data)`, `logout()`, `requestPasswordReset(email)`, `resetPassword(token, newPassword)`. Al montar, hidrata el estado desde `localStorage` si hay sesión guardada.
- `ProtectedRoute`: redirige a `/login` si no hay sesión.
- `RoleRoute({ roles: [...] })`: redirige a la home del rol del usuario si su rol no está en la lista permitida.
- Interceptor de 401: si cualquier llamada autenticada devuelve 401 (token vencido/inválido), se limpia la sesión y se redirige a `/login`.

## Navegación por rol

Tras login exitoso, redirección a la home de cada rol:
- `Client` → `/mis-mascotas`
- `Veterinarian` → `/turnos-asignados`
- `Administrator` → `/usuarios`
- `SysAdmin` → `/administradores`

Cada rol ve un `Sidebar` propio con sus enlaces (mismo patrón que el mock: brand + tag de rol + nav), montado dentro de un `Layout` compartido (`sidebar` + `main`).

## Formularios centrados — dos patrones

1. **Auth (pantalla completa, sin sidebar)**: contenedor `.auth-wrap` (flex, centrado vertical y horizontal, min-height 100%) con `.auth-card` adentro (max-width 420px, fondo blanco/card, border-radius 18px, sombra). Usado en Login, Register, ForgotPassword, ResetPassword.
2. **Formularios dentro del panel (con sidebar)**: `.ficha` con `max-width` 480–520px y `margin: 0 auto`, centrado horizontalmente dentro del área `.main` de contenido. Usado en: alta/edición de mascota, solicitud de turno, alta de veterinario, alta de administrador, y las páginas de "Mi perfil" de los 4 roles.

## Componentes reutilizables

- `AuthCard` — envoltorio del patrón 1.
- `FormCard` — envoltorio del patrón 2 (con `maxWidth` prop).
- `Field` — `<label>` + input/select/textarea + hint opcional, estilo `.f` del mock.
- `ErrorBanner` — lista de mensajes de error (recibe array, ya separado por `~`), estilo alerta arriba del formulario.
- `Button` — variantes `primary`, `outline`, `danger`, `ghost` (clases `.btn-*` del mock).
- `Badge` — estados de turno: `pending`, `confirmed`, `cancelled`, `completed`, con colores del mock.
- `EntityRow` / `entity-card` — fila de lista para usuarios/veterinarios/mascotas/turnos, con avatar de iniciales y acciones (editar/eliminar) en hover.
- `Sidebar` — recibe rol y lista de links, resalta el link activo.
- `Layout` — sidebar + main, usado por todas las rutas autenticadas.
- `ConfirmDeleteOverlay` — overlay simple (sin Radix) para confirmar eliminación, con botones Cancelar/Eliminar, calcado del `.modal-mock` del mock.

## Manejo de errores de formulario

Dado que el backend no asocia mensajes a campos, cada formulario usa `ErrorBanner`: al recibir un 400, se muestra la lista completa de mensajes (ya separados por `~`) en un banner arriba del formulario. No se intenta mapear mensajes a inputs individuales.

## Campo Raza (mascotas)

Al seleccionar el campo Tipo en el formulario de mascota, se dispara `GET /api/breeds?typePet={tipo}`. Si la respuesta es exitosa y no vacía, el campo Raza se renderiza como `<select>` con las opciones devueltas. Si la llamada falla (error de red, 500, o lista vacía), el campo cae a un `<input>` de texto libre como fallback, sin bloquear el flujo de creación de la mascota.

## Testing

No se agregan tests automatizados en este ciclo (fuera de alcance). Verificación manual: correr backend (`dotnet run` en `VetCareBackend/src/VetCareBackend`) y frontend (`npm run dev`), probar flujo completo de registro → login → alta de mascota → solicitud de turno como Client, y verificar redirecciones de rol para Veterinarian/Administrator/SysAdmin con usuarios creados manualmente vía Swagger o base de datos.
