# Sistema de Restaurante - Viticos

Un sistema completo de gestión de restaurante construido con Next.js 14, TypeScript, Tailwind CSS y MongoDB.

## 🚀 Características

- **Gestión de Usuarios**: Sistema completo de usuarios con roles y permisos
- **Autenticación Segura**: Login, logout, verificación de correo, recuperación de contraseña
- **Panel de Administración**: Dashboard intuitivo para gestión del sistema
- **Verificación de Correo**: Sistema robusto de verificación para administradores
- **Gestión de Sesiones**: Control avanzado de sesiones con detección de cierre de navegador
- **Setup Automático**: Configuración inicial automatizada del sistema

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js 14
│   ├── api/               # Endpoints de API
│   │   ├── auth/          # Autenticación
│   │   ├── users/         # Gestión de usuarios
│   │   ├── setup/         # Configuración inicial
│   │   └── admin/         # Funciones administrativas
│   ├── dashboard/         # Páginas del panel
│   ├── login/             # Página de login
│   └── globals.css        # Estilos globales
├── components/            # Componentes React organizados
│   ├── ui/               # Componentes de interfaz básicos
│   │   ├── InputField.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── ModalHeader.tsx
│   │   ├── LoadingPage.tsx
│   │   └── index.ts
│   ├── auth/             # Componentes de autenticación
│   │   ├── LoginPage.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── index.ts
│   ├── layout/           # Componentes de layout
│   │   ├── PanelLayout.tsx
│   │   ├── PanelSidebar.tsx
│   │   └── index.ts
│   ├── forms/            # Componentes de formularios
│   │   ├── RolesDropdown.tsx
│   │   ├── AdminVerification.tsx
│   │   └── index.ts
│   ├── users/            # Componentes específicos de usuarios
│   │   ├── UserTable.tsx
│   │   ├── EditUserModal.tsx
│   │   └── UserRegisterModal.tsx
│   └── index.ts          # Exportaciones centralizadas
├── hooks/                # Custom hooks
│   ├── useAuth.ts
│   ├── useUserActivity.ts
│   └── useServerInit.ts
├── lib/                  # Utilidades y configuraciones
│   ├── constants.ts      # Constantes del sistema
│   ├── utils.ts          # Funciones utilitarias
│   ├── mongodb.ts        # Configuración de base de datos
│   └── token-utils.ts    # Utilidades de tokens
├── models/               # Modelos de MongoDB
│   └── User.ts
├── types/                # Tipos TypeScript
│   ├── user.ts
│   ├── auth.ts
│   ├── api.ts
│   └── index.ts
└── middleware.ts         # Middleware de Next.js
```

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: JWT, bcryptjs
- **Email**: Nodemailer con Gmail SMTP
- **Validación**: Zod, React Hook Form
- **Linting**: ESLint, Prettier

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd restaurant-system
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp env.example .env.local
```

Editar `.env.local` con tus configuraciones:
```env
MONGODB_URI=mongodb://localhost:27017/restaurant
SMTP_EMAIL=tu-email@gmail.com
SMTP_PASSWORD=tu-contraseña-de-aplicación
NEXTAUTH_SECRET=tu-secret-key
```

### 4. Ejecutar el proyecto
```bash
npm run dev
```

### 5. Configuración inicial
Accede a `http://localhost:3000` y sigue el wizard de configuración inicial.

## 📋 Funcionalidades Principales

### Gestión de Usuarios
- ✅ Crear, editar y eliminar usuarios
- ✅ Asignar roles y permisos
- ✅ Verificación de correo obligatoria para administradores
- ✅ Control de estado activo/inactivo
- ✅ Protección contra auto-edición

### Autenticación y Seguridad
- ✅ Login seguro con JWT
- ✅ Logout automático al cerrar navegador
- ✅ Recuperación de contraseña
- ✅ Verificación de correo electrónico
- ✅ Control de sesiones múltiples

### Panel de Administración
- ✅ Dashboard con estadísticas
- ✅ Gestión completa de usuarios
- ✅ Configuración del sistema
- ✅ Logs de actividad

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Construcción para producción
npm run start        # Servidor de producción
npm run lint         # Verificar código con ESLint
npm run format       # Formatear código con Prettier
```

## 📝 Convenciones de Código

### Estructura de Componentes
- **UI Components**: Componentes reutilizables básicos
- **Auth Components**: Componentes relacionados con autenticación
- **Layout Components**: Componentes de estructura y navegación
- **Form Components**: Componentes de formularios especializados
- **User Components**: Componentes específicos de gestión de usuarios

### Nomenclatura
- **Archivos**: PascalCase para componentes, camelCase para utilidades
- **Componentes**: PascalCase
- **Funciones**: camelCase
- **Constantes**: UPPER_SNAKE_CASE
- **Tipos**: PascalCase

### Importaciones
```typescript
// Importaciones organizadas
import React from 'react';
import { motion } from 'framer-motion';

// Componentes locales
import { InputField, ErrorMessage } from '@/components/ui';
import { ProtectedRoute } from '@/components/auth';
import { PanelLayout } from '@/components/layout';

// Hooks y utilidades
import { useAuth } from '@/hooks/useAuth';
import { API_ENDPOINTS } from '@/lib/constants';

// Tipos
import type { User, AuthUser } from '@/types';
```

## 🔒 Seguridad

- **Autenticación JWT**: Tokens seguros con expiración
- **Verificación de Correo**: Obligatoria para roles administrativos
- **Control de Sesiones**: Detección de cierre de navegador
- **Validación de Datos**: Zod para validación robusta
- **Protección de Rutas**: Middleware de autenticación
- **Rate Limiting**: Protección contra ataques de fuerza bruta

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Otros Proveedores
- **Netlify**: Compatible con Next.js
- **Railway**: Soporte nativo para Node.js
- **DigitalOcean**: App Platform

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación en `/docs`

---

**Desarrollado con ❤️ para Viticos Restaurant System**
