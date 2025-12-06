/**
 * Application configuration constants
 * Centralized configuration for easy maintenance and updates
 */

// Tickets Configuration
export const TICKETS = {
  TOTAL: 10000,
  MIN_PER_REFERENCE: 1,
  MAX_PER_REFERENCE: 20,
  DEFAULT_PER_REFERENCE: 5,
  NUMBER_LENGTH: 4, // 4 digits (0000-9999)
  MAX_GENERATION_ATTEMPTS: 10000,
} as const;

// Reference Configuration
export const REFERENCE = {
  LENGTH: 6,
  PATTERN: /^\d{6}$/,
} as const;

// Raffle Configuration
export const RAFFLE = {
  NAME: 'Gran Rifa 2025',
  DATE: new Date('2025-12-31T20:00:00'), // 31 de Diciembre, 2025 - 8:00 PM
  TIMEZONE: 'America/Caracas',
  DATE_FORMATTED: '31 de Diciembre, 2025',
  TIME_FORMATTED: '8:00 PM',
} as const;

// API Configuration
// En desarrollo, siempre usar backend local
const getApiBaseUrl = () => {
  const explicitUrl = import.meta.env.VITE_API_BASE_URL;
  const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  // Si hay una variable de entorno explícita, usarla
  if (explicitUrl) {
    return explicitUrl;
  }
  
  // En desarrollo, usar backend local
  if (isDev) {
    const localUrl = 'http://localhost:3001';
    console.log('[Config] Modo desarrollo detectado, usando backend local:', localUrl);
    return localUrl;
  }
  
  // En producción, usar backend desde variable de entorno o fallback
  const prodUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  console.log('[Config] Modo producción, usando:', prodUrl);
  return prodUrl;
};

export const API = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000, // 30 seconds
  ENDPOINTS: {
    VALIDATE_REFERENCE: '/validate-reference',
    GENERATE_TICKETS: '/generate-tickets',
    STATS: '/stats',
  },
} as const;

// Log la URL final en desarrollo
if (import.meta.env.DEV) {
  console.log('[Config] API Base URL configurada:', API.BASE_URL);
}

// Validation Patterns
export const VALIDATION_PATTERNS = {
  REFERENCE: /^\d{6}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  CEDULA: /^[VE]-\d{6,8}$/i, // Venezuelan ID format: V-12345678 or E-12345678
} as const;

// Contact Information
export const CONTACT = {
  PHONE: '+58 412-1234567',
  EMAIL: 'contacto@granrifa.com',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  REFERENCE_INVALID: 'El número de referencia debe tener exactamente 6 dígitos',
  REFERENCE_NOT_FOUND: 'Número de referencia no válido',
  REFERENCE_ALREADY_USED: 'Este número de referencia ya ha sido utilizado',
  FIELDS_REQUIRED: 'Por favor completa todos los campos',
  EMAIL_INVALID: 'Por favor ingresa un correo electrónico válido',
  PHONE_INVALID: 'Por favor ingresa un número de teléfono válido',
  CEDULA_INVALID: 'Por favor ingresa una cédula válida (formato: V-12345678)',
  CONNECTION_ERROR: 'Error de conexión con el servidor',
  TICKETS_GENERATION_ERROR: 'Error al generar los números',
  INSUFFICIENT_TICKETS: 'No hay suficientes números disponibles',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  REFERENCE_VALID: 'Referencia válida',
  TICKETS_GENERATED: 'Números generados exitosamente',
  REGISTRATION_SUCCESS: '¡Registro exitoso! Tus números han sido asignados correctamente.',
} as const;

