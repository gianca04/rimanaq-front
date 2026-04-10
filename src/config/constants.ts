/**
 * Configuraciones centralizadas de la aplicación
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://rimanaq.sat-sistemas.uk/api',
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

// UI Configuration (Duolingo Style - Flat Colors)
export const UI_CONFIG = {
  COLORS: {
    PRIMARY: '#58CC02', // Duolingo Green
    SECONDARY: '#1CB0F6', // Duolingo Blue
    ACCENT: '#FFC800', // Duolingo Yellow
    TEXT: '#4B4B4B',
    BACKGROUND: '#FFFFFF',
    BORDER: '#E5E5E5',
    ERROR: '#FF4B4B',
  },
  // Manteniendo las claves pero sin gradientes
  STYLES: {
    AUTH: 'bg-white',
    REGISTER: 'bg-white',
    MAIN: 'bg-[#F7F7F7]',
  },
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
} as const;