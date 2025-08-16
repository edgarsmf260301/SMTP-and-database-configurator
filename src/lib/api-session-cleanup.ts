import { deviceSessionManager } from './device-session-manager';

class APISessionCleanupManager {
  private static instance: APISessionCleanupManager;
  private lastCleanup: number = 0;
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutos

  private constructor() {
    console.log(
      '🧹 [API SESSION CLEANUP] Sistema de limpieza de APIs iniciado'
    );
  }

  static getInstance(): APISessionCleanupManager {
    if (!APISessionCleanupManager.instance) {
      APISessionCleanupManager.instance = new APISessionCleanupManager();
    }
    return APISessionCleanupManager.instance;
  }

  // Función para verificar si es necesario hacer limpieza
  shouldCleanup(): boolean {
    const now = Date.now();
    return now - this.lastCleanup > this.CLEANUP_INTERVAL;
  }

  // Función para ejecutar limpieza
  performCleanup(): void {
    try {
      console.log('🧹 [API SESSION CLEANUP] Iniciando limpieza de sesiones...');

      // Limpiar sesiones expiradas del DeviceSessionManager
      deviceSessionManager.cleanupExpiredSessions();

      // Obtener estadísticas actuales
      const stats = deviceSessionManager.getStats();

      console.log(
        `🧹 [API SESSION CLEANUP] Limpieza completada. Estadísticas:`,
        {
          totalSessions: stats.totalSessions,
          activeSessions: stats.activeSessions,
          inactiveSessions: stats.inactiveSessions,
        }
      );

      // Actualizar timestamp de última limpieza
      this.lastCleanup = Date.now();
    } catch (error) {
      console.error('💥 [API SESSION CLEANUP] Error durante limpieza:', error);
    }
  }

  // Función para limpiar sesiones específicas por usuario
  cleanupUserSessions(userId: string): number {
    try {
      const userSessions = deviceSessionManager.getSessionsByUser(userId);
      let cleanedCount = 0;

      for (const session of userSessions) {
        // Cerrar sesión del dispositivo
        const closed = deviceSessionManager.closeDeviceSession(
          session.userAgent,
          session.ipAddress
        );

        if (closed) {
          cleanedCount++;
        }
      }

      console.log(
        `🧹 [API SESSION CLEANUP] Limpiadas ${cleanedCount} sesiones del usuario ${userId}`
      );
      return cleanedCount;
    } catch (error) {
      console.error(
        '💥 [API SESSION CLEANUP] Error limpiando sesiones del usuario:',
        error
      );
      return 0;
    }
  }

  // Función para obtener estado del sistema de limpieza
  getStatus() {
    return {
      lastCleanup: this.lastCleanup,
      cleanupInterval: this.CLEANUP_INTERVAL,
      shouldCleanup: this.shouldCleanup(),
      nextCleanup: this.lastCleanup + this.CLEANUP_INTERVAL,
    };
  }
}

export const apiSessionCleanupManager = APISessionCleanupManager.getInstance();
