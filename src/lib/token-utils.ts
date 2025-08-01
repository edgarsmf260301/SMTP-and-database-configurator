import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Genera un token de verificación seguro de 6 dígitos
 * @returns Token de 6 dígitos
 */
export function generateVerificationToken(): string {
  // Generar un número aleatorio de 6 dígitos usando crypto
  const randomBytes = crypto.randomBytes(3); // 3 bytes = 24 bits
  const randomNumber = randomBytes.readUIntBE(0, 3); // Leer como número de 24 bits
  const token = (randomNumber % 900000) + 100000; // Asegurar que sea de 6 dígitos (100000-999999)
  return token.toString();
}

/**
 * Compara un token de verificación con su hash
 * @param candidateToken - Token a verificar
 * @param hashedToken - Hash del token almacenado
 * @returns true si coinciden, false si no
 */
export async function compareVerificationToken(candidateToken: string, hashedToken: string): Promise<boolean> {
  try {
    if (!hashedToken) return false;
    return await bcrypt.compare(candidateToken, hashedToken);
  } catch (error) {
    console.error('Error comparing verification token:', error);
    return false;
  }
}

/**
 * Genera un token JWT seguro para autenticación
 * @param payload - Datos a incluir en el token
 * @param secret - Clave secreta para firmar el token
 * @param expiresIn - Tiempo de expiración (ej: '24h', '7d')
 * @returns Token JWT
 */
export function generateJWTToken(payload: any, secret: string, expiresIn: string = '24h'): string {
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verifica un token JWT
 * @param token - Token JWT a verificar
 * @param secret - Clave secreta para verificar el token
 * @returns Datos del token si es válido, null si no
 */
export function verifyJWTToken(token: string, secret: string): any {
  try {
    const jwt = require('jsonwebtoken');
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
} 