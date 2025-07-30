# 🍽️ Restaurant Viticos System

Sistema de gestión integral para restaurantes desarrollado con tecnologías modernas.

## 🚀 Características

- **🔐 Autenticación Segura** - Sistema de login con JWT
- **📊 Dashboard Administrativo** - Estadísticas en tiempo real
- **🍽️ Gestión de Menú** - CRUD completo de productos
- **📋 Sistema de Pedidos** - Seguimiento de pedidos
- **👥 Gestión de Usuarios** - Roles y permisos
- **📱 Diseño Responsivo** - Optimizado para todos los dispositivos

## 🛠️ Tecnologías

- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **ESLint & Prettier** - Calidad de código

## 📦 Instalación

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
   ```bash
   # Crear archivo .env.local
   MONGODB_URI=mongodb://localhost:27017/restaurant-viticos
   JWT_SECRET=tu_jwt_secret_aqui
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

```
restaurant-viticos-system/
├── src/
│   ├── app/                    # App Router
│   │   ├── dashboard/         # Dashboard
│   │   └── api/               # API Routes
│   ├── components/            # Componentes
│   ├── lib/                   # Configuraciones
│   ├── models/                # Modelos MongoDB
│   ├── types/                 # Tipos TypeScript
│   ├── utils/                 # Utilidades
│   └── docs/                  # Documentación
├── public/                    # Archivos estáticos
└── [config files]
```

## 🎯 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Ejecutar ESLint
- `npm run lint:fix` - Corregir errores ESLint
- `npm run format` - Formatear con Prettier

## 🔧 Configuración

### Base de Datos
- **MongoDB Local**: Instalar MongoDB Community Server
- **MongoDB Atlas**: Crear cluster en la nube

### Variables de Entorno
```env
MONGODB_URI=mongodb://localhost:27017/restaurant-viticos
JWT_SECRET=tu_jwt_secret_aqui
NEXTAUTH_SECRET=tu_nextauth_secret_aqui
NEXT_PUBLIC_APP_NAME=Restaurant Viticos System
```

## 📚 Documentación

Para información detallada, consulta la [documentación completa](./src/docs/README.md).

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Desarrollador

- **Edgar SMF**
- **Email**: edgarsmfp26@gmail.com
- **GitHub**: [@edgarsmf260301](https://github.com/edgarsmf260301)

## 📈 Roadmap

- [ ] Sistema de notificaciones en tiempo real
- [ ] Integración con sistemas de pago
- [ ] App móvil para clientes
- [ ] Sistema de reservas
- [ ] Reportes avanzados
- [ ] Integración con impresoras de cocina
- [ ] Sistema de inventario
- [ ] Múltiples sucursales

---

⭐ **¡Dale una estrella al proyecto si te gusta!**
