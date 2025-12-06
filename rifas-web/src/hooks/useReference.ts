/**
 * Custom hook for reference validation
 */

import { useState, useCallback } from 'react';
import { validateReference as validateReferenceService } from '@/services/referenceService';
import { handleApiError, logError } from '@/utils/errorHandler';
import type { ValidateReferenceResponse } from '@/types';

export const useReference = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(async (reference: string): Promise<ValidateReferenceResponse> => {
    setLoading(true);
    setError(null);

    try {
      const result = await validateReferenceService(reference);
      
      if (!result.valid) {
        setError(result.message || 'Referencia no válida');
      }

      return result;
    } catch (err) {
      const appError = handleApiError(err);
      logError(appError, 'useReference.validate');
      setError(appError.message);
      
      return {
        valid: false,
        message: appError.message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    validate,
    loading,
    error,
    clearError,
  };
};

