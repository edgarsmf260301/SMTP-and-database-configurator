# Documentación de Seguridad - Sistema de Restaurante

## 🔒 **Medidas de Seguridad Implementadas**

### 1. **Protección contra Fuerza Bruta**

#### Rate Limiting

- **Límite de intentos**: 4 intentos fallidos
- **Tiempo de bloqueo**: 240 segundos (4 minutos)
- **Ventana de tiempo**: 5 minutos para resetear intentos
- **Identificación por IP**: Bloqueo basado en dirección IP del cliente
- **Persistencia**: El bloqueo persiste incluso si se refresca la página

#### Implementación

```typescript
// Sistema de rate limiting automático
const rateLimiter = RateLimiter.getInstance();
const status = rateLimiter.isBlocked(clientIP);
```

### 2. **Gestión Segura de Tokens**

#### Tokens HTTPOnly

- **Autenticación**: `auth-token` almacenado en cookies HTTPOnly
- **Sesión**: `session-id` para tracking de sesión
- **Verificación**: `verification-token` para verificación de email
- **Recuperación**: `reset-token` para reset de contraseña

#### Configuración de Cookies

```typescript
response.cookies.set('auth-token', token, {
  httpOnly: true, // No accesible desde JavaScript
  secure: true, // Solo HTTPS en producción
  sameSite: 'strict', // Protección CSRF
  maxAge: 24 * 60 * 60, // 24 horas
  path: '/', // Ruta específica
});
```

### 3. **Validación de Contraseñas**

#### Requisitos Mínimos

- **Longitud mínima**: 6 caracteres
- **Validación**: Frontend y backend
- **Hashing**: bcrypt con salt de 10 rondas

#### Implementación

```typescript
// Validación en el modelo
password: {
  type: String,
  required: [true, 'La contraseña es requerida'],
  minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
}

// Hashing automático
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});
```

### 4. **Headers de Seguridad**

#### Headers Implementados

```typescript
// Headers de seguridad en Next.js
{
  'X-Frame-Options': 'DENY',                    // Prevenir clickjacking
  'X-Content-Type-Options': 'nosniff',          // Prevenir MIME sniffing
  'X-XSS-Protection': '1; mode=block',          // Protección XSS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': 'default-src \'self\'...',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}
```

### 5. **Protección de Rutas**

#### Middleware de Seguridad

- **Verificación de autenticación**: Todas las rutas protegidas
- **Validación de sesión**: Tokens de autenticación y sesión
- **Protección CSRF**: Cookies SameSite strict
- **Bloqueo de bots**: Detección de User-Agents sospechosos

#### Rutas Protegidas

```typescript
const PROTECTED_ROUTES = [
  '/dashboard',
  '/api/auth',
  '/api/admin',
  '/api/users',
  '/api/restaurant',
  '/api/orders',
  '/api/menu',
  '/api/reports',
];
```

### 6. **Validación de Entrada**

#### Esquemas de Validación

- **Zod**: Validación de esquemas TypeScript
- **Sanitización**: Limpieza de datos de entrada
- **Validación de tipos**: Verificación estricta de tipos

#### Ejemplo

```typescript
const loginSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});
```

### 7. **Manejo de Errores Seguro**

#### Principios

- **No revelar información sensible**: Mensajes de error genéricos
- **Logging seguro**: No exponer datos sensibles en logs
- **Manejo de excepciones**: Captura y manejo seguro de errores

#### Implementación

```typescript
// Error genérico para login fallido
return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });

// No revelar si el email existe o no
if (!user) {
  return NextResponse.json({
    success: true,
    message:
      'Si el email existe en nuestro sistema, recibirás un enlace de recuperación',
  });
}
```

### 8. **Protección de Base de Datos**

#### Conexiones Seguras

- **MongoDB**: Conexión con autenticación
- **Base de datos específica**: Uso de base 'Restaurant'
- **Validación de esquemas**: Mongoose con validación estricta
- **Índices de seguridad**: Para campos críticos

#### Implementación

```typescript
// Uso de base específica
const db = mongoose.connection.useDb('Restaurant');
const UserRestaurant = db.model('User', User.schema);

// Validación de esquema
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email válido'],
  },
});
```

### 9. **Monitoreo y Logging**

#### Health Check

- **Endpoint**: `/api/health-check`
- **Monitoreo**: Estado de MongoDB, rate limiter, variables de entorno
- **Métricas**: Tiempo de respuesta, uptime, estadísticas

#### Rate Limiter Stats

```typescript
const stats = rateLimiter.getStats();
// {
//   totalEntries: number,
//   blockedEntries: number,
//   activeEntries: number
// }
```

### 10. **Configuración de Producción**

#### Variables de Entorno

```bash
# Requeridas para funcionamiento seguro
MONGODB_URI=mongodb+srv://...
SMTP_EMAIL=admin@restaurante.com
SMTP_PASSWORD=app_password
NEXTAUTH_SECRET=random_secret_32_chars
```

#### Configuración Next.js

```typescript
// Optimizaciones de seguridad
experimental: {
  serverComponentsExternalPackages: ['bcryptjs'],
},
compiler: {
  removeConsole: process.env.NODE_ENV === 'production',
},
```

## 🚨 **Vulnerabilidades Mitigadas**

### ✅ **Ataques de Fuerza Bruta**

- Rate limiting por IP
- Bloqueo temporal progresivo
- Persistencia del bloqueo

### ✅ **Robo de Tokens**

- Cookies HTTPOnly
- No almacenamiento en localStorage
- Expiración automática

### ✅ **Ataques CSRF**

- Cookies SameSite strict
- Tokens de sesión únicos
- Validación de origen

### ✅ **Inyección de Código**

- Validación de entrada estricta
- Sanitización de datos
- Esquemas de validación

### ✅ **XSS (Cross-Site Scripting)**

- Headers de seguridad
- Content Security Policy
- Escape de datos de salida

### ✅ **Clickjacking**

- X-Frame-Options: DENY
- Frame-ancestors: 'none'

### ✅ **MIME Sniffing**

- X-Content-Type-Options: nosniff
- Validación de tipos de contenido

### ✅ **Path Traversal**

- Validación de rutas
- Bloqueo de caracteres peligrosos

## 📋 **Checklist de Seguridad**

- [x] Rate limiting implementado
- [x] Tokens HTTPOnly configurados
- [x] Validación de contraseñas robusta
- [x] Headers de seguridad configurados
- [x] Middleware de protección implementado
- [x] Validación de entrada con Zod
- [x] Manejo seguro de errores
- [x] Conexiones de base de datos seguras
- [x] Monitoreo y health check
- [x] Configuración de producción segura

## 🔧 **Mantenimiento de Seguridad**

### Actualizaciones Regulares

- **Dependencias**: `npm audit` y `npm update`
- **MongoDB**: Mantener versión actualizada
- **Next.js**: Actualizar a versiones LTS

### Monitoreo Continuo

- **Logs de seguridad**: Revisar logs de rate limiting
- **Health checks**: Monitorear estado del sistema
- **Auditorías**: Revisar logs de autenticación

### Pruebas de Seguridad

- **Penetration testing**: Pruebas regulares de penetración
- **Vulnerability scanning**: Escaneo de vulnerabilidades
- **Code review**: Revisión de código de seguridad

## 📞 **Reporte de Vulnerabilidades**

Si encuentras una vulnerabilidad de seguridad, por favor:

1. **NO** la reportes públicamente
2. Envía un email a: security@restaurante.com
3. Incluye detalles específicos de la vulnerabilidad
4. Espera confirmación antes de publicar

## 📚 **Recursos Adicionales**

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [bcrypt Security](https://en.wikipedia.org/wiki/Bcrypt)
