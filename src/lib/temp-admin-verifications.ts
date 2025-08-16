// Usar un singleton global para que el Map sobreviva a recargas y sea compartido entre rutas
const globalAny = global as any;
if (!globalAny._tempAdminVerifications) {
  globalAny._tempAdminVerifications = new Map();
}
if (!globalAny._tempAdminVerifiedEmails) {
  globalAny._tempAdminVerifiedEmails = new Set();
}
export const tempAdminVerifications: Map<string, any> =
  globalAny._tempAdminVerifications;
const tempAdminVerifiedEmails: Set<string> = globalAny._tempAdminVerifiedEmails;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function setTempAdminVerification(email: string, data: any) {
  tempAdminVerifications.set(normalizeEmail(email), data);
}

export function getTempAdminVerification(email: string) {
  return tempAdminVerifications.get(normalizeEmail(email));
}

export function deleteTempAdminVerification(email: string) {
  tempAdminVerifications.delete(normalizeEmail(email));
}

export function setTempAdminEmailVerified(email: string) {
  tempAdminVerifiedEmails.add(normalizeEmail(email));
}

export function consumeTempAdminEmailVerified(email: string): boolean {
  const key = normalizeEmail(email);
  if (tempAdminVerifiedEmails.has(key)) {
    tempAdminVerifiedEmails.delete(key);
    return true;
  }
  return false;
}
