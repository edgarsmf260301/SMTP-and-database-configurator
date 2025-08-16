import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

// Rutas que no requieren verificación de sesión
const PUBLIC_ROUTES = [
  '/login',
  '/api/auth/login',
  '/api/setup/check-status',
  '/api/auth/check-session',
  '/api/auth/browser-close',
  '/api/auth/mark-inactive',
  '/api/auth/mark-active',
  '/api/auth/check-activity',
  '/api/auth/force-cleanup',
  '/api/init',
];

// Rutas que siempre requieren verificación
const PROTECTED_ROUTES = ['/dashboard', '/admin', '/api/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  logger.debug('MW', request.method, pathname);

  // Si es una ruta pública, permitir acceso
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    logger.debug('MW allow public', pathname);
    return NextResponse.next();
  }

  // Si no es una ruta protegida, permitir acceso
  if (!PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    logger.debug('MW allow non-protected', pathname);
    return NextResponse.next();
  }

  // Solo verificar sesión para rutas protegidas
  // Obtener cookies
  const authToken = request.cookies.get('auth-token')?.value;
  const sessionId = request.cookies.get('session-id')?.value;

  // Si no hay token o session-id, redirigir a login
  if (!authToken || !sessionId) {
    logger.info('MW redirect login: missing cookies');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
