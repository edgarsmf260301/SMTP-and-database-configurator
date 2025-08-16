import fs from 'fs';
import path from 'path';
import { logger, maskDeviceId, maskId } from '@/lib/logger';

interface DeviceSession {
  deviceId: string;
  userId: string;
  sessionId: string;
  lastActivity: number;
  userAgent: string;
  ipAddress: string;
  isActive: boolean;
  lastStatusChange: number;
}

export class DeviceSessionManager {
  private static instance: DeviceSessionManager;
  private sessionsDir: string;
  // Clave: sessionId (permite múltiples sesiones por dispositivo)
  private activeSessions: Map<string, DeviceSession> = new Map();
  private readonly INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 1 hora de inactividad
  private readonly TAKEOVER_GRACE_MS = 45 * 1000; // 45s sin actividad permite toma de control en emergencia

  private constructor() {
    this.sessionsDir = path.join(process.cwd(), '.device-sessions');
    this.ensureSessionsDirectory();
    this.loadExistingSessions();
  }

  static getInstance(): DeviceSessionManager {
    if (!DeviceSessionManager.instance) {
      DeviceSessionManager.instance = new DeviceSessionManager();
    }
    return DeviceSessionManager.instance;
  }

  private ensureSessionsDirectory() {
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
      const gitignorePath = path.join(this.sessionsDir, '.gitignore');
      if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, '*\n!.gitignore\n');
      }
    }
  }

  private loadExistingSessions() {
    try {
      const files = fs.readdirSync(this.sessionsDir);
      const sessionFiles = files.filter(file => file.endsWith('.json'));

      for (const file of sessionFiles) {
        const filePath = path.join(this.sessionsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const session: DeviceSession = JSON.parse(content);

        const now = Date.now();
        const sessionAge = now - session.lastActivity;
        const maxSessionAge = this.INACTIVITY_TIMEOUT_MS; // respetar timeout de inactividad

        if (sessionAge < maxSessionAge) {
          this.activeSessions.set(session.sessionId, session);
        } else {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      logger.error('DeviceSession load error', error);
    }
  }

  private generateDeviceId(userAgent: string, ipAddress: string): string {
    const combined = `${userAgent}_${ipAddress}`;
    return Buffer.from(combined).toString('base64').substring(0, 32);
  }

  private isSessionStale(session: DeviceSession): boolean {
    return Date.now() - session.lastActivity > this.INACTIVITY_TIMEOUT_MS;
  }

  public getInactivityTimeoutMs(): number {
    return this.INACTIVITY_TIMEOUT_MS;
  }

  public getDeviceSession(
    userAgent: string,
    ipAddress: string
  ): DeviceSession | null {
    const deviceId = this.generateDeviceId(userAgent, ipAddress);
    for (const session of this.activeSessions.values()) {
      if (session.deviceId === deviceId) return session;
    }
    return null;
  }

  /**
   * Permite tomar control de la sesión si las otras sesiones del mismo usuario
   * no muestran actividad reciente (posible apagado brusco) o ya están vencidas.
   * Cierra dichas sesiones y autoriza el login.
   */
  public attemptUserTakeover(
    userId: string,
    currentUserAgent: string,
    currentIpAddress: string
  ): { allowed: boolean; takeover: boolean; closedCount: number } {
    let closedCount = 0;
    const now = Date.now();
    const currentDeviceId = this.generateDeviceId(
      currentUserAgent,
      currentIpAddress
    );

    // Cerrar todas las sesiones existentes del usuario (excepto la actual si existe)
    for (const session of this.activeSessions.values()) {
      if (session.userId !== userId) continue;
      const deviceId = session.deviceId;
      if (deviceId === currentDeviceId) continue;

      // Cerrar sesiones inactivas o vencidas
      const inactiveLongEnough =
        now - session.lastActivity > this.TAKEOVER_GRACE_MS;
      if (
        this.isSessionStale(session) ||
        inactiveLongEnough ||
        !session.isActive
      ) {
        const closed = this.closeDeviceSessionById(session.sessionId);
        if (closed) closedCount++;
      }
    }

    // Siempre permitir el login, cerrando sesiones antiguas si es necesario
    return { allowed: true, takeover: closedCount > 0, closedCount };
  }

  canDeviceLogin(
    _userAgent: string,
    _ipAddress: string
  ): { allowed: boolean; existingUserId?: string } {
    // Permitir múltiples usuarios por dispositivo (no bloquear por dispositivo)
    return { allowed: true };
  }

  createDeviceSession(
    userId: string,
    sessionId: string,
    userAgent: string,
    ipAddress: string
  ): boolean {
    try {
      const deviceId = this.generateDeviceId(userAgent, ipAddress);

      const session: DeviceSession = {
        deviceId,
        userId,
        sessionId,
        lastActivity: Date.now(),
        userAgent,
        ipAddress,
        isActive: true,
        lastStatusChange: Date.now(),
      };

      this.activeSessions.set(sessionId, session);

      const fileName = `${sessionId}.json`;
      const filePath = path.join(this.sessionsDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(session, null, 2));

      logger.info(
        'Device session created',
        maskDeviceId(deviceId),
        maskId(userId)
      );
      return true;
    } catch (error) {
      logger.error('Device session create error', error);
      return false;
    }
  }

  updateDeviceActivity(userAgent: string, ipAddress: string): boolean {
    try {
      const deviceId = this.generateDeviceId(userAgent, ipAddress);
      let sessionId: string | null = null;
      let session: DeviceSession | null = null;
      for (const [sid, s] of this.activeSessions.entries()) {
        if (s.deviceId !== deviceId) continue;
        if (!session || s.lastActivity > session.lastActivity) {
          sessionId = sid;
          session = s;
        }
      }

      if (session && sessionId) {
        // Si la sesión ya está vencida por inactividad, cerrarla y no reactivarla
        if (this.isSessionStale(session)) {
          const fileName = `${sessionId}.json`;
          const filePath = path.join(this.sessionsDir, fileName);
          this.activeSessions.delete(sessionId);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          logger.info(
            'Device session expired by inactivity',
            maskDeviceId(deviceId),
            maskId(session.userId)
          );
          return false;
        }
        session.lastActivity = Date.now();
        if (!session.isActive) {
          session.isActive = true;
          session.lastStatusChange = Date.now();
          logger.debug('Device active', maskDeviceId(deviceId));
        }
        const fileName = `${sessionId}.json`;
        const filePath = path.join(this.sessionsDir, fileName);
        fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Device activity error', error);
      return false;
    }
  }

  markDeviceInactive(userAgent: string, ipAddress: string): boolean {
    try {
      const deviceId = this.generateDeviceId(userAgent, ipAddress);
      const session = this.activeSessions.get(deviceId);

      if (session) {
        session.isActive = false;
        session.lastStatusChange = Date.now();
        const fileName = `${deviceId}.json`;
        const filePath = path.join(this.sessionsDir, fileName);
        fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
        logger.debug('Device inactive', maskDeviceId(deviceId));
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Device inactive error', error);
      return false;
    }
  }

  closeDeviceSession(userAgent: string, ipAddress: string): boolean {
    try {
      const deviceId = this.generateDeviceId(userAgent, ipAddress);
      let closedAny = false;
      for (const [sid, session] of this.activeSessions.entries()) {
        if (session.deviceId !== deviceId) continue;
        this.activeSessions.delete(sid);
        const fileName = `${sid}.json`;
        const filePath = path.join(this.sessionsDir, fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        logger.info(
          'Device session closed',
          maskDeviceId(deviceId),
          maskId(session.userId)
        );
        closedAny = true;
      }
      return closedAny;
    } catch (error) {
      logger.error('Device close error', error);
      return false;
    }
  }

  // Cerrar sesión por sessionId
  closeDeviceSessionById(sessionId: string): boolean {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return false;
      this.activeSessions.delete(sessionId);
      const fileName = `${sessionId}.json`;
      const filePath = path.join(this.sessionsDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      logger.info(
        'Device session closed',
        maskDeviceId(session.deviceId),
        maskId(session.userId)
      );
      return true;
    } catch (error) {
      logger.error('Device close by id error', error);
      return false;
    }
  }

  // Actualizar actividad por sessionId
  updateSessionActivityById(sessionId: string): boolean {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return false;

      if (this.isSessionStale(session)) {
        this.activeSessions.delete(sessionId);
        const filePath = path.join(this.sessionsDir, `${sessionId}.json`);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        logger.info(
          'Device session expired by inactivity',
          maskDeviceId(session.deviceId),
          maskId(session.userId)
        );
        return false;
      }

      session.lastActivity = Date.now();
      if (!session.isActive) {
        session.isActive = true;
        session.lastStatusChange = Date.now();
        logger.debug('Device active', maskDeviceId(session.deviceId));
      }

      const filePath = path.join(this.sessionsDir, `${sessionId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
      return true;
    } catch (error) {
      logger.error('Device activity by id error', error);
      return false;
    }
  }

  // Marcar inactivo por sessionId
  markDeviceInactiveBySessionId(sessionId: string): boolean {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return false;

      session.isActive = false;
      session.lastStatusChange = Date.now();
      const filePath = path.join(this.sessionsDir, `${sessionId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
      logger.debug('Device inactive', maskDeviceId(session.deviceId));
      return true;
    } catch (error) {
      logger.error('Device inactive by id error', error);
      return false;
    }
  }

  isUserLoggedInElsewhere(userId: string, currentSessionId?: string): boolean {
    for (const [sid, session] of this.activeSessions.entries()) {
      if (session.userId !== userId) continue;
      // Excluir la sesión actual si se proporciona
      if (currentSessionId && sid === currentSessionId) continue;

      // Limpiar sesiones vencidas o inactivas
      if (this.isSessionStale(session) || !session.isActive) {
        this.closeDeviceSessionById(sid);
        continue;
      }

      // Solo considerar sesiones realmente activas y recientes
      const now = Date.now();
      const isRecentlyActive =
        now - session.lastActivity < this.INACTIVITY_TIMEOUT_MS / 2; // 30 minutos

      if (isRecentlyActive) {
        return true;
      }
    }
    return false;
  }

  getStats() {
    const activeCount = Array.from(this.activeSessions.values()).filter(
      s => s.isActive
    ).length;
    const inactiveCount = Array.from(this.activeSessions.values()).filter(
      s => !s.isActive
    ).length;

    return {
      totalSessions: this.activeSessions.size,
      activeSessions: activeCount,
      inactiveSessions: inactiveCount,
      sessionsDir: this.sessionsDir,
    };
  }

  cleanupExpiredSessions() {
    try {
      const now = Date.now();
      const maxSessionAge = this.INACTIVITY_TIMEOUT_MS; // limpiar sesiones vencidas por inactividad (1 hora)

      for (const [sid, session] of this.activeSessions.entries()) {
        const sessionAge = now - session.lastActivity;
        if (sessionAge > maxSessionAge) {
          this.activeSessions.delete(sid);
          const fileName = `${sid}.json`;
          const filePath = path.join(this.sessionsDir, fileName);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          logger.info('Device session cleaned', maskDeviceId(session.deviceId));
        }
      }
    } catch (error) {
      logger.error('Device cleanup error', error);
    }
  }

  getSessionsByUser(userId: string): DeviceSession[] {
    return Array.from(this.activeSessions.values()).filter(
      session => session.userId === userId
    );
  }

  isDeviceActive(userAgent: string, ipAddress: string): boolean {
    const deviceId = this.generateDeviceId(userAgent, ipAddress);
    const session = this.activeSessions.get(deviceId);
    return session ? session.isActive : false;
  }
}

export const deviceSessionManager = DeviceSessionManager.getInstance();
