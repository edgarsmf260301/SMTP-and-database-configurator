interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blockedUntil: number;
  lastAttempt: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private attempts: Map<string, RateLimitEntry> = new Map();
  private readonly MAX_ATTEMPTS = 4;
  private readonly BLOCK_DURATION = 240000; // 240 segundos en milisegundos
  private readonly WINDOW_SIZE = 300000; // 5 minutos en milisegundos
  private cleanupInterval: NodeJS.Timeout | null = null;

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
      // Iniciar limpieza automática
      RateLimiter.instance.startAutoCleanup();
    }
    return RateLimiter.instance;
  }

  private startAutoCleanup(): void {
    // Limpiar cada 5 minutos
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000
    );
  }

  private stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Generar identificador único por dispositivo (UA + IP)
  private generateDeviceIdentifier(
    userAgent: string,
    ipAddress: string
  ): string {
    const combined = `${userAgent}_${ipAddress}`;
    return Buffer.from(combined).toString('base64').substring(0, 32);
  }

  isBlocked(
    userAgent: string,
    ipAddress: string
  ): { blocked: boolean; remainingTime: number; attemptsLeft: number } {
    const identifier = this.generateDeviceIdentifier(userAgent, ipAddress);
    const entry = this.attempts.get(identifier);

    if (!entry) {
      return {
        blocked: false,
        remainingTime: 0,
        attemptsLeft: this.MAX_ATTEMPTS,
      };
    }

    const now = Date.now();

    // Si está bloqueado, verificar si ya expiró el bloqueo
    if (entry.blockedUntil > now) {
      const remainingTime = Math.ceil((entry.blockedUntil - now) / 1000);
      return { blocked: true, remainingTime, attemptsLeft: 0 };
    }

    // Si el bloqueo expiró, resetear intentos
    if (entry.blockedUntil > 0 && entry.blockedUntil <= now) {
      this.attempts.delete(identifier);
      return {
        blocked: false,
        remainingTime: 0,
        attemptsLeft: this.MAX_ATTEMPTS,
      };
    }

    // Verificar si está en la ventana de tiempo
    if (now - entry.firstAttempt > this.WINDOW_SIZE) {
      this.attempts.delete(identifier);
      return {
        blocked: false,
        remainingTime: 0,
        attemptsLeft: this.MAX_ATTEMPTS,
      };
    }

    const attemptsLeft = Math.max(0, this.MAX_ATTEMPTS - entry.attempts);
    return { blocked: false, remainingTime: 0, attemptsLeft };
  }

  recordAttempt(
    userAgent: string,
    ipAddress: string
  ): { blocked: boolean; remainingTime: number; attemptsLeft: number } {
    const identifier = this.generateDeviceIdentifier(userAgent, ipAddress);
    const now = Date.now();
    const entry = this.attempts.get(identifier) || {
      attempts: 0,
      firstAttempt: now,
      blockedUntil: 0,
      lastAttempt: now,
    };

    entry.attempts++;
    entry.lastAttempt = now;

    // Si es el primer intento, establecer el tiempo de inicio de la ventana
    if (entry.attempts === 1) {
      entry.firstAttempt = now;
    }

    // Si se alcanzó el límite de intentos, bloquear
    if (entry.attempts >= this.MAX_ATTEMPTS) {
      entry.blockedUntil = now + this.BLOCK_DURATION;
      this.attempts.set(identifier, entry);

      const remainingTime = Math.ceil(this.BLOCK_DURATION / 1000);
      return { blocked: true, remainingTime, attemptsLeft: 0 };
    }

    this.attempts.set(identifier, entry);
    const attemptsLeft = Math.max(0, this.MAX_ATTEMPTS - entry.attempts);
    return { blocked: false, remainingTime: 0, attemptsLeft };
  }

  resetAttempts(userAgent: string, ipAddress: string): void {
    const identifier = this.generateDeviceIdentifier(userAgent, ipAddress);
    this.attempts.delete(identifier);
  }

  // Limpiar entradas expiradas
  cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [identifier, entry] of this.attempts.entries()) {
      if (entry.blockedUntil > 0 && entry.blockedUntil <= now) {
        this.attempts.delete(identifier);
        cleanedCount++;
      } else if (now - entry.firstAttempt > this.WINDOW_SIZE) {
        this.attempts.delete(identifier);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[RateLimiter] Limpiadas ${cleanedCount} entradas expiradas`);
    }

    // Limpiar memoria si hay demasiadas entradas
    if (this.attempts.size > 10000) {
      console.warn(
        `[RateLimiter] Muchas entradas activas (${this.attempts.size}), forzando limpieza`
      );
      this.forceCleanup();
    }
  }

  // Limpieza forzada para casos de emergencia
  private forceCleanup(): void {
    const now = Date.now();
    const entriesToKeep = new Map<string, RateLimitEntry>();

    for (const [identifier, entry] of this.attempts.entries()) {
      // Mantener solo entradas recientes (últimos 10 minutos)
      if (now - entry.lastAttempt < 10 * 60 * 1000) {
        entriesToKeep.set(identifier, entry);
      }
    }

    const removedCount = this.attempts.size - entriesToKeep.size;
    this.attempts = entriesToKeep;

    console.log(
      `[RateLimiter] Limpieza forzada: removidas ${removedCount} entradas`
    );
  }

  // Obtener estadísticas del rate limiter
  getStats(): {
    totalEntries: number;
    blockedEntries: number;
    activeEntries: number;
  } {
    const now = Date.now();
    let blockedCount = 0;
    let activeCount = 0;

    for (const entry of this.attempts.values()) {
      if (entry.blockedUntil > now) {
        blockedCount++;
      } else if (now - entry.firstAttempt <= this.WINDOW_SIZE) {
        activeCount++;
      }
    }

    return {
      totalEntries: this.attempts.size,
      blockedEntries: blockedCount,
      activeEntries: activeCount,
    };
  }

  // Destructor para limpiar recursos
  destroy(): void {
    this.stopAutoCleanup();
    this.attempts.clear();
  }
}

// Manejar cierre graceful de la aplicación
process.on('SIGINT', () => {
  const rateLimiter = RateLimiter.getInstance();
  rateLimiter.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  const rateLimiter = RateLimiter.getInstance();
  rateLimiter.destroy();
  process.exit(0);
});

export default RateLimiter.getInstance();
