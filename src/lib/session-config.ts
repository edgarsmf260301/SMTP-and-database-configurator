// Configuración centralizada para timeouts de sesión
export const SESSION_CONFIG = {
  // Timeout de inactividad (2 horas)
  INACTIVITY_TIMEOUT: 2 * 60 * 60 * 1000, // 2 horas en milisegundos

  // Intervalo para verificar sesión (5 minutos)
  SESSION_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutos en milisegundos

  // Intervalo para verificar estado del usuario (30 segundos)
  USER_STATUS_CHECK_INTERVAL: 30 * 1000, // 30 segundos en milisegundos

  // Tiempo antes de mostrar advertencia (10 minutos)
  WARNING_THRESHOLD: 10 * 60 * 1000, // 10 minutos en milisegundos

  // Tiempo de renovación de token (1 hora)
  TOKEN_RENEWAL_THRESHOLD: 60 * 60 * 1000, // 1 hora en milisegundos

  // Duración del token (24 horas)
  TOKEN_DURATION: '24h',

  // Tiempo de la pantalla de "Cerrando sesión" (1.2 segundos)
  LOGOUT_DISPLAY_TIME: 1200, // 1.2 segundos en milisegundos
} as const;

// Función helper para convertir milisegundos a formato legible
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return '0 minutos';

  const minutes = Math.ceil(milliseconds / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours} hora${hours !== 1 ? 's' : ''} y ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}`;
  }

  return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
}

// Función helper para verificar si una sesión está por expirar
export function isSessionExpiringSoon(timeSinceLastActivity: number): boolean {
  return (
    timeSinceLastActivity >
    SESSION_CONFIG.INACTIVITY_TIMEOUT - SESSION_CONFIG.WARNING_THRESHOLD
  );
}

// Función helper para obtener el tiempo restante de sesión
export function getSessionTimeRemaining(timeSinceLastActivity: number): number {
  return Math.max(0, SESSION_CONFIG.INACTIVITY_TIMEOUT - timeSinceLastActivity);
}
