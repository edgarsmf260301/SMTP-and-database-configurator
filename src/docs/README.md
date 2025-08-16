# Restaurant System

## Descripción del Proyecto

Sistema de gestión integral para restaurantes desarrollado con Next.js, TypeScript, Tailwind CSS y MongoDB. Este sistema permite la administración completa de un restaurante, incluyendo gestión de usuarios, menú, pedidos y reportes.

## Características Principales

### 🔐 Autenticación y Autorización

- Sistema de login seguro con JWT
- Roles de usuario: Admin, Manager, Staff
- Gestión de sesiones y permisos

### 📊 Dashboard Administrativo

- Estadísticas en tiempo real
- Gestión de pedidos
- Reportes de ventas
- Análisis de rendimiento

### 🍽️ Gestión de Menú

- CRUD completo de productos
- Categorización de platos
- Control de disponibilidad
- Gestión de precios

### 📋 Sistema de Pedidos

- Creación y seguimiento de pedidos
- Estados de pedido (Pendiente, Preparando, Listo, Entregado)
- Historial de pedidos
- Notas y personalizaciones

### 👥 Gestión de Usuarios

- Registro de nuevos usuarios
- Perfiles de usuario
- Control de acceso por roles
- Gestión de personal

## Tecnologías Utilizadas

### Frontend

- **Next.js 14** - Framework de React con App Router
- **TypeScript** - Tipado estático para mayor seguridad
- **Tailwind CSS** - Framework de CSS utility-first
- **React Hooks** - Gestión de estado y efectos

### Backend

- **Next.js API Routes** - API REST integrada
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **bcryptjs** - Encriptación de contraseñas
- **jsonwebtoken** - Autenticación JWT

### Herramientas de Desarrollo

- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **TypeScript** - Compilador y tipado

## Estructura del Proyecto

```
restaurant-viticos-system/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── dashboard/         # Dashboard principal
│   │   └── api/               # API Routes
│   ├── components/            # Componentes reutilizables
│   ├── lib/                   # Configuraciones (MongoDB, etc.)
│   ├── models/                # Modelos de Mongoose
│   ├── types/                 # Tipos TypeScript
│   ├── utils/                 # Utilidades y helpers
│   └── docs/                  # Documentación
├── public/                    # Archivos estáticos
└── [archivos de configuración]
```

## Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- MongoDB (local o Atlas)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/edgarsmf260301/restaurant-system.git
   cd restaurant-viticos-system
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crear archivo `.env.local`:

   ```env
   MONGODB_URI=mongodb://localhost:27017/restaurant-viticos
   JWT_SECRET=tu_jwt_secret_aqui
   NEXTAUTH_SECRET=tu_nextauth_secret_aqui
   ```

4. **Ejecutar en desarrollo**

   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Ejecutar ESLint
- `npm run lint:fix` - Corregir errores de ESLint
- `npm run format` - Formatear código con Prettier

## Configuración de Base de Datos

### MongoDB Local

1. Instalar MongoDB Community Server
2. Iniciar el servicio de MongoDB
3. Configurar la URI en `.env.local`

### MongoDB Atlas

1. Crear cuenta en MongoDB Atlas
2. Crear cluster
3. Obtener connection string
4. Configurar en `.env.local`

## API Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios

- `GET /api/users` - Obtener usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Menú

- `GET /api/menu` - Obtener menú
- `POST /api/menu` - Crear producto
- `PUT /api/menu/:id` - Actualizar producto
- `DELETE /api/menu/:id` - Eliminar producto

### Pedidos

- `GET /api/orders` - Obtener pedidos
- `POST /api/orders` - Crear pedido
- `PUT /api/orders/:id` - Actualizar pedido
- `DELETE /api/orders/:id` - Eliminar pedido

## Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

- **Desarrollador**: Edgar SMF
- **Email**: edgarsmfp26@gmail.com
- **GitHub**: [@edgarsmf260301](https://github.com/edgarsmf260301)

## Changelog

### v1.0.0 (2024-07-29)

- ✅ Sistema de autenticación implementado
- ✅ Dashboard administrativo básico
- ✅ Estructura de proyecto optimizada
- ✅ Configuración de MongoDB
- ✅ Tipos TypeScript definidos
- ✅ UI moderna con Tailwind CSS

## Roadmap

### Próximas Características

- [ ] Sistema de notificaciones en tiempo real
- [ ] Integración con sistemas de pago
- [ ] App móvil para clientes
- [ ] Sistema de reservas
- [ ] Reportes avanzados
- [ ] Integración con impresoras de cocina
- [ ] Sistema de inventario
- [ ] Múltiples sucursales
