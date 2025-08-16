export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
};

function getCurrentLevel(): LogLevel {
  const envLevel =
    (process.env.LOG_LEVEL as LogLevel) ||
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
  return Object.prototype.hasOwnProperty.call(LEVELS, envLevel)
    ? envLevel
    : 'info';
}

function shouldLog(targetLevel: LogLevel): boolean {
  const current = getCurrentLevel();
  return LEVELS[targetLevel] >= LEVELS[current];
}

export function maskId(
  value: string,
  visibleStart = 4,
  visibleEnd = 2
): string {
  if (!value || typeof value !== 'string') return 'hidden';
  if (value.length <= visibleStart + visibleEnd)
    return `${value.slice(0, 1)}***`;
  return `${value.slice(0, visibleStart)}***${value.slice(-visibleEnd)}`;
}

export function maskDeviceId(deviceId: string): string {
  if (!deviceId) return 'device:hidden';
  return `${deviceId.slice(0, 6)}…`;
}

export function maskIp(ip: string | null | undefined): string {
  if (!ip || ip === 'unknown') return 'ip:hidden';
  if (ip === '::1') return 'ip:local';
  // Very simple IPv4 masking: keep first 3 octets, hide last
  const ipv4 = ip.match(/^\d{1,3}(?:\.\d{1,3}){3}$/);
  if (ipv4) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}.x`;
  }
  // For other formats (IPv6, proxies) just hide
  return 'ip:hidden';
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) console.debug(...args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) console.info(...args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (shouldLog('error')) console.error(...args);
  },
  level: getCurrentLevel,
};
