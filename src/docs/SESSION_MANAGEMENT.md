# Sistema de Gestión de Sesiones

## Descripción General

El sistema implementa un mecanismo completo de gestión de sesiones que limpia automáticamente las sesiones de usuario en diferentes escenarios para garantizar la seguridad y evitar conflictos de sesiones.

## Funcionalidades Implementadas

### 1. Logout Manual (Cierre de Sesión)

**Endpoint:** `POST /api/auth/logout`

**Comportamiento:**

- Limpia TODAS las sesiones del usuario (no solo la actual)
- Cierra la sesión actual como respaldo
- Elimina las cookies de autenticación
- Registra la acción en los logs

**Código relevante:**

```typescript
// Limpiar TODAS las sesiones del usuario
const userSessions = deviceSessionManager.getSessionsByUser(userId);
for (const session of userSessions) {
  const closed = deviceSessionManager.closeDeviceSessionById(session.sessionId);
  if (closed) closedCount++;
}
```

### 2. Deshabilitación de Usuario por Admin

**Endpoint:** `POST /api/admin/users/toggle-status`

**Comportamiento:**

- Cuando un admin deshabilita un usuario, se limpian automáticamente todas sus sesiones
- El usuario es redirigido al login
- Se registra la acción como "user_disabled"

**Código relevante:**

```typescript
if (action === 'disable') {
  // Limpiar sesiones del API session cleanup manager
  apiSessionCleanupManager.cleanupUserSessions(userId);

  // También limpiar sesiones del device session manager
  const userSessions = deviceSessionManager.getSessionsByUser(userId);
  for (const session of userSessions) {
    const closed = deviceSessionManager.closeDeviceSessionById(
      session.sessionId
    );
  }
}
```

### 3. Detección de Cierre de Navegador

**Endpoint:** `POST /api/auth/browser-close`

**Comportamiento:**

- Detecta cuando el usuario cierra la ventana/navegador bruscamente
- Limpia automáticamente todas las sesiones del usuario
- Usa `navigator.sendBeacon()` para mayor confiabilidad
- Se ejecuta en múltiples eventos: `beforeunload`, `visibilitychange`, `pagehide`

**Hook:** `useBrowserCloseDetection`

**Eventos detectados:**

- `beforeunload`: Cuando se cierra la ventana/navegador
- `visibilitychange`: Cuando la pestaña se oculta
- `pagehide`: Cuando la página se descarga

**Código relevante:**

```typescript
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/auth/browser-close');
  }
};
```

## Componentes y Hooks

### BrowserCloseHandler

- Componente que maneja la detección de cierre de navegador
- Se integra en el layout principal
- No renderiza nada, solo maneja eventos

### useBrowserCloseDetection

- Hook personalizado para detectar eventos de cierre
- Configurable con callbacks personalizados
- Maneja múltiples tipos de eventos

## Gestión de Sesiones

### DeviceSessionManager

- Gestiona sesiones por dispositivo
- Almacena sesiones en archivos JSON
- Limpia sesiones expiradas automáticamente
- Permite múltiples sesiones por usuario

### Funciones Principales:

- `closeDeviceSessionById()`: Cierra una sesión específica
- `getSessionsByUser()`: Obtiene todas las sesiones de un usuario
- `cleanupExpiredSessions()`: Limpia sesiones expiradas
- `attemptUserTakeover()`: Permite tomar control de sesiones inactivas

## Seguridad

### Características de Seguridad:

1. **Limpieza automática**: Las sesiones se limpian en múltiples escenarios
2. **Detección de cierre**: Se detecta cuando el usuario cierra el navegador
3. **Prevención de conflictos**: Solo una sesión activa por usuario
4. **Logging completo**: Todas las acciones se registran para auditoría
5. **Manejo de errores**: Sistema robusto que maneja fallos graciosamente

### Escenarios Cubiertos:

- ✅ Usuario hace logout manual
- ✅ Admin deshabilita usuario
- ✅ Usuario cierra navegador/ventana
- ✅ Usuario cierra pestaña
- ✅ Sesiones expiradas por inactividad
- ✅ Conflictos de sesiones múltiples

## Configuración

### Variables de Entorno:

- `JWT_SECRET`: Se genera automáticamente si no existe
- `NODE_ENV`: Configuración de desarrollo/producción

### Timeouts:

- **Inactividad**: 1 hora (60 _ 60 _ 1000 ms)
- **Toma de control**: 45 segundos (45 \* 1000 ms)

## Logs y Monitoreo

### Tipos de Logs:

- `info`: Acciones exitosas de limpieza de sesiones
- `warn`: Sesiones no encontradas o tokens inválidos
- `error`: Errores durante la limpieza

### Información Registrada:

- ID de usuario (enmascarado)
- ID de sesión (enmascarado)
- Cantidad de sesiones cerradas
- Razón de la limpieza (logout, browser_close, user_disabled)
- Timestamps de las acciones

## Uso

### Para Desarrolladores:

1. El sistema funciona automáticamente sin configuración adicional
2. Los eventos de cierre se detectan globalmente
3. Las sesiones se limpian automáticamente en todos los escenarios

### Para Administradores:

1. Al deshabilitar un usuario, sus sesiones se limpian automáticamente
2. Los logs muestran todas las acciones de limpieza
3. El sistema previene conflictos de sesiones múltiples

## Mantenimiento

### Limpieza Automática:

- Las sesiones expiradas se limpian automáticamente
- Los archivos de sesión se almacenan en `.device-sessions/`
- Se incluye un `.gitignore` para evitar commitear sesiones

### Monitoreo:

- Revisar logs regularmente para detectar patrones anómalos
- Verificar estadísticas de sesiones activas
- Monitorear el directorio `.device-sessions/`
