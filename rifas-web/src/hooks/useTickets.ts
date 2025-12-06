/**
 * Custom hook for ticket operations
 */

import { useState, useCallback } from 'react';
import { generateTickets as generateTicketsService, getStats as getStatsService } from '@/services/ticketService';
import { handleApiError, logError } from '@/utils/errorHandler';
import type { GenerateTicketsResponse, StatsResponse, UserData } from '@/types';

export const useTickets = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (
    reference: string,
    userData: UserData,
    ticketCount: number
  ): Promise<GenerateTicketsResponse> => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateTicketsService(reference, userData, ticketCount);
      
      if (!result.success) {
        setError(result.error || 'Error al generar tickets');
      }

      return result;
    } catch (err) {
      const appError = handleApiError(err);
      logError(appError, 'useTickets.generate');
      setError(appError.message);
      
      return {
        success: false,
        error: appError.message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const getStats = useCallback(async (): Promise<StatsResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      return await getStatsService();
    } catch (err) {
      const appError = handleApiError(err);
      logError(appError, 'useTickets.getStats');
      setError(appError.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generate,
    getStats,
    loading,
    error,
    clearError,
  };
};

