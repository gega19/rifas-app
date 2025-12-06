/**
 * Centralized error handling utilities
 */

import type { ApiError } from '../types';

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Error codes for different error types
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Handles API errors and converts them to AppError
 */
export const handleApiError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new AppError(
        'Error de conexión con el servidor',
        ERROR_CODES.NETWORK_ERROR,
        0,
        error
      );
    }

    // Generic error
    return new AppError(
      error.message || 'Error desconocido',
      ERROR_CODES.UNKNOWN_ERROR,
      undefined,
      error
    );
  }

  // Unknown error type
  return new AppError(
    'Error desconocido',
    ERROR_CODES.UNKNOWN_ERROR,
    undefined,
    error
  );
};

/**
 * Logs an error to the console (in development) or error tracking service (in production)
 */
export const logError = (error: AppError, context?: string): void => {
  if (import.meta.env.DEV) {
    console.error(`[Error] ${context || 'Unknown context'}:`, {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      originalError: error.originalError,
    });
  }
  // In production, you could send to error tracking service (e.g., Sentry)
};
