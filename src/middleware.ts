import { NextRequest, NextResponse } from 'next/server';

// Rutas que requieren configuración completa
const PROTECTED_ROUTES = [
  '/dashboard',
  '/api/auth',
  '/api/admin',
  '/api/users',
  '/api/restaurant',
  '/api/orders',
  '/api/menu',
  '/api/reports'
];

// Rutas de configuración que están permitidas
const SETUP_ROUTES = [
  '/',
  '/api/setup',
  '/setup',
  '/_next',
  '/favicon.ico'
];

// Rutas públicas que siempre están permitidas
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas de Next.js y recursos estáticos
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // Verificar si el sistema está configurado
  const isSystemConfigured = await checkSystemConfiguration();

  // Si el sistema NO está configurado
  if (!isSystemConfigured) {
    // Solo permitir rutas de configuración
    if (SETUP_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }
    
    // BLOQUEAR TODAS LAS DEMÁS RUTAS y redirigir a la página principal (setup wizard)
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si el sistema SÍ está configurado
  if (isSystemConfigured) {
    // Siempre permitir rutas de setup (para verificación de email)
    if (SETUP_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }
    
    // Permitir rutas públicas
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }
    
    // Verificar si es una ruta protegida
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    
    if (isProtectedRoute) {
      // Verificar autenticación
      const isAuthenticated = await checkAuthentication(request);
      
      if (!isAuthenticated) {
        // Redirigir a login si no está autenticado
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  return NextResponse.next();
}

async function checkSystemConfiguration(): Promise<boolean> {
  try {
    // Verificar variables de entorno directamente
    // En el Edge Runtime, solo podemos acceder a process.env
    const requiredVars = [
      'MONGODB_URI',
      'SMTP_EMAIL',
      'SMTP_PASSWORD',
      'NEXTAUTH_SECRET'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      return false;
    }

    // Si las variables están presentes, asumimos que el sistema está configurado
    // La verificación completa se hace en la página principal
    return true;
  } catch (error) {
    console.error('Error checking system configuration:', error);
    return false;
  }
}

async function checkAuthentication(request: NextRequest): Promise<boolean> {
  try {
    // Verificar si hay una sesión válida
    const authToken = request.cookies.get('auth-token')?.value;

    if (!authToken) {
      return false;
    }

    // Por ahora, solo verificamos que existe el token
    // La validación completa se hará en las API routes
    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 