/**
 * Application configuration constants
 * Centralized configuration for easy maintenance and updates
 */

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
    ADMIN_LOGIN: '/admin/login',
    ADMIN_ME: '/admin/me',
    ANALYTICS_DASHBOARD: '/admin/analytics/dashboard',
    ANALYTICS_PARTICIPANTS: '/admin/analytics/participants',
    ANALYTICS_TICKETS: '/admin/analytics/tickets',
    ANALYTICS_ACTIVITY: '/admin/analytics/activity',
    REFERENCES: '/admin/references',
    PARTICIPANTS: '/admin/participants',
    TICKETS: '/admin/tickets',
  },
} as const;

// Log la URL final en desarrollo
if (import.meta.env.DEV) {
  console.log('[Config] API Base URL configurada:', API.BASE_URL);
}


