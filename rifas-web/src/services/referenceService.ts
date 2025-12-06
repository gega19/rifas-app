/**
 * Reference service - handles reference validation
 */

import { API, ERROR_MESSAGES } from '@/constants/config';
import { handleApiError } from '@/utils/errorHandler';
import type { ValidateReferenceResponse } from '@/types';

/**
 * Validates a reference number with the backend
 */
export const validateReference = async (
  reference: string
): Promise<ValidateReferenceResponse> => {
  try {
    // Limpiar la referencia antes de enviarla
    const cleanReference = reference.trim();
    
    console.log(`[Frontend] Validando referencia: "${cleanReference}"`);
    console.log(`[Frontend] API Base URL: ${API.BASE_URL}`);
    
    const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.VALIDATE_REFERENCE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reference: cleanReference }),
    });

    const data = await response.json();
    console.log(`[Frontend] Respuesta del servidor:`, data);

    if (!response.ok) {
      return {
        valid: false,
        message: data.message || data.error || 'Error al validar la referencia',
      };
    }

    return data;
  } catch (error) {
    console.error('[Frontend] Error en validateReference:', error);
    const appError = handleApiError(error);
    
    // Return user-friendly error response
    return {
      valid: false,
      message: appError.message || ERROR_MESSAGES.CONNECTION_ERROR,
    };
  }
};

