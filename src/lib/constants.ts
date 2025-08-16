// API Endpoints
export const API_ENDPOINTS = {
  USERS: '/api/users',
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    CHECK_SESSION: '/api/auth/check-session',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    BROWSER_CLOSE: '/api/auth/browser-close',
  },
  SETUP: {
    CHECK_STATUS: '/api/setup/check-status',
    CHECK_ENV: '/api/setup/check-env',
    TEST_MONGODB: '/api/setup/test-mongodb',
    TEST_SMTP: '/api/setup/test-smtp',
    CREATE_ADMIN: '/api/setup/create-admin',
    VERIFY_EMAIL: '/api/setup/verify-email',
  },
  VERIFICATION: {
    SEND_EMAIL: '/api/users/send-verification-email',
    VERIFY_CODE: '/api/users/verify-code',
  },
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  DIRECTOR: 'director',
  MANAGER: 'manager',
  STAFF: 'staff',
  BOX: 'box',
  KITCHEN: 'kitchen',
  ADMINISTRATION: 'administration',
  WAITER: 'Waiter',
} as const;

// Verification Settings
export const VERIFICATION_SETTINGS = {
  CODE_EXPIRY_SECONDS: 120,
  RESET_PASSWORD_EXPIRY_MINUTES: 15,
  MAX_RESET_ATTEMPTS: 3,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  LOADING_DELAY: 1200,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  NOT_FOUND: 'Recurso no encontrado',
  VALIDATION_ERROR: 'Error de validación',
  SERVER_ERROR: 'Error interno del servidor',
  NETWORK_ERROR: 'Error de conexión',
  INVALID_TOKEN: 'Token inválido',
  SESSION_EXPIRED: 'Sesión expirada',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'Usuario creado exitosamente',
  USER_UPDATED: 'Usuario actualizado exitosamente',
  USER_DELETED: 'Usuario eliminado exitosamente',
  EMAIL_VERIFIED: 'Correo verificado exitosamente',
  PASSWORD_RESET: 'Contraseña restablecida exitosamente',
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGOUT_SUCCESS: 'Cierre de sesión exitoso',
} as const;
