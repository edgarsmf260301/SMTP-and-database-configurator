# 🍽️ Restaurant Viticos System

Sistema de gestión completo para restaurantes desarrollado con Next.js, TypeScript, MongoDB y Tailwind CSS.

## ✨ Características

- 🎨 **Interfaz moderna y atractiva** con diseño UX/UI optimizado
- 🔐 **Sistema de autenticación seguro** con JWT
- 📊 **Dashboard administrativo** completo
- 🗄️ **Base de datos MongoDB** con Mongoose
- 📧 **Sistema de emails** con SMTP de Gmail
- ⚡ **Configuración automática** paso a paso
- 📱 **Diseño responsive** para todos los dispositivos
- 🎯 **Validación de formularios** con Zod
- 🔧 **Configuración de ESLint y Prettier**

## 🚀 Configuración Inicial

### Requisitos Previos

1. **Node.js** (versión 18 o superior)
2. **MongoDB Atlas** o MongoDB local
3. **Cuenta de Gmail** para SMTP

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd restaurant-system
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**
   ```
   http://localhost:3000
   ```

## 🔧 Configuración del Sistema

El sistema incluye un **asistente de configuración automático** que te guiará paso a paso:

### Paso 1: Bienvenida
- Información general del sistema
- Requisitos previos

### Paso 2: Configuración de MongoDB
- Ingresa tu URI de conexión de MongoDB
- **Guía de configuración de IP:**
  - Para permitir todas las conexiones: `0.0.0.0/0`
  - Para mayor seguridad: IP específica de tu proveedor

### Paso 3: Configuración de Email SMTP
- **Configuración de Gmail:**
  1. Ve a tu cuenta de Google
  2. Activa la verificación en dos pasos
  3. Genera una contraseña de aplicación
  4. Usa esa contraseña en el sistema

### Paso 4: Usuario Administrador
- Crea tu cuenta de administrador principal
- Se creará automáticamente la base de datos `Restaurant_System`
- Se creará la colección `Users`

### Paso 5: Completado
- ¡Listo para usar el sistema!

## 📁 Estructura del Proyecto

```
restaurant-system/
├── src/
│   ├── app/
│   │   ├── api/           # APIs del sistema
│   │   ├── dashboard/     # Dashboard principal
│   │   └── page.tsx       # Página de login
│   ├── components/        # Componentes React
│   ├── lib/              # Utilidades y configuraciones
│   ├── models/           # Modelos de MongoDB
│   └── types/            # Tipos TypeScript
├── public/               # Archivos estáticos
└── env.example          # Variables de entorno de ejemplo
```

## 🛠️ Tecnologías Utilizadas

- **Frontend:** Next.js 15, React 19, TypeScript
- **Estilos:** Tailwind CSS 4
- **Base de Datos:** MongoDB con Mongoose
- **Autenticación:** JWT
- **Validación:** Zod
- **Formularios:** React Hook Form
- **Email:** Nodemailer con SMTP
- **Linting:** ESLint
- **Formateo:** Prettier

## 🔒 Variables de Entorno

Copia el archivo `env.example` a `.env.local` y configura las variables:

```env
# MongoDB
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/restaurant-system

# SMTP Gmail
SMTP_EMAIL=tu-email@gmail.com
SMTP_PASSWORD=tu-contraseña-de-aplicación

# Aplicación
NEXTAUTH_SECRET=clave-secreta-generada
NEXTAUTH_URL=http://localhost:3000
```

## 📝 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Servidor de producción
npm run lint         # Ejecutar ESLint
```

## 🎨 Diseño y UX

- **Paleta de colores:** Naranja, rojo y amarillo (temática restaurante)
- **Gradientes modernos** para elementos visuales
- **Animaciones suaves** para mejor experiencia
- **Iconos SVG** integrados
- **Diseño responsive** para móviles y desktop

## 🔧 Configuración de Desarrollo

### ESLint
El proyecto incluye configuración de ESLint para mantener la calidad del código.

### Prettier
Configurado para formateo automático del código.

### TypeScript
Configuración estricta para mejor desarrollo.

## 📞 Soporte

Si necesitas ayuda con la configuración o tienes preguntas:

1. Revisa la documentación en `/src/docs/`
2. Verifica los logs del servidor
3. Contacta al equipo de desarrollo

## 📄 Licencia

Este proyecto es propiedad de Restaurant Viticos. Todos los derechos reservados.

---

**¡Disfruta gestionando tu restaurante con nuestro sistema! 🍕🍔🍜**
