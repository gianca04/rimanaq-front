/**
 * Configuraciones centralizadas de la aplicación
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8000/api',
  TIMEOUT: 10000, // 10 seconds
} as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
  LEARNING_PROGRESS: 'learningProgress',
} as const;

// Application Messages
export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: '✅ Login exitoso!',
    REGISTER_SUCCESS: '✅ Registro exitoso!',
    LOGOUT_SUCCESS: '✅ Usuario deslogueado',
    CHECKING_AUTH: '🤟 Verificando autenticación...',
    NO_AUTH_FOUND: 'ℹ️ No hay usuario autenticado',
  },
  VALIDATION: {
    REQUIRED_NAME: 'El nombre es obligatorio',
    REQUIRED_EMAIL: 'El email es obligatorio',
    MIN_PASSWORD_LENGTH: 'La contraseña debe tener al menos 8 caracteres',
    PASSWORDS_MISMATCH: 'Las contraseñas no coinciden',
  },
  ERRORS: {
    NETWORK_ERROR: 'No se pudo conectar al servidor. Verifica tu conexión.',
    UNKNOWN_ERROR: 'Error desconocido',
    COURSES_LOAD_ERROR: 'No se pudieron cargar los cursos. Verifica tu conexión a internet.',
  },
} as const;

// UI Configuration
export const UI_CONFIG = {
  GRADIENTS: {
    AUTH: 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500',
    REGISTER: 'bg-gradient-to-br from-green-500 via-blue-500 to-purple-500',
    MAIN: 'bg-gradient-to-br from-blue-500 via-teal-400 to-green-400',
  },
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
} as const;