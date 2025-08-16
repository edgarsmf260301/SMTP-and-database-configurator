import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

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
export async function compareVerificationToken(
  candidateToken: string,
  hashedToken: string
): Promise<boolean> {
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
export function generateJWTToken(
  payload: any,
  secret: string,
  expiresIn: string = '24h'
): string {
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

// Generador de secreto aleatorio
function generateSecret(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Función para asegurar que JWT_SECRET existe en .env.local
export function ensureJWTSecret(): string {
  const envPath = path.resolve(process.cwd(), '.env.local');

  // Si JWT_SECRET ya está definido en las variables de entorno, usarlo
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  // Verificar si el archivo .env.local existe
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');

    // Si JWT_SECRET ya está en el archivo, leerlo
    const jwtSecretMatch = envContent.match(/JWT_SECRET=(.+)/);
    if (jwtSecretMatch) {
      return jwtSecretMatch[1];
    }

    // Si no existe, agregarlo al final del archivo
    const jwtSecret = generateSecret();
    const newEnvContent = envContent + `\nJWT_SECRET=${jwtSecret}\n`;
    fs.writeFileSync(envPath, newEnvContent, 'utf8');

    // Actualizar process.env para esta sesión
    process.env.JWT_SECRET = jwtSecret;

    return jwtSecret;
  } else {
    // Si el archivo no existe, crearlo con JWT_SECRET
    const jwtSecret = generateSecret();
    const envContent = `# Configuración de la Aplicación\nJWT_SECRET=${jwtSecret}\nNODE_ENV=development\n`;
    fs.writeFileSync(envPath, envContent, 'utf8');

    // Actualizar process.env para esta sesión
    process.env.JWT_SECRET = jwtSecret;

    return jwtSecret;
  }
}

// Función para obtener JWT_SECRET de forma segura
export function getJWTSecret(): string {
  return process.env.JWT_SECRET || ensureJWTSecret();
}
