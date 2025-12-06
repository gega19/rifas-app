/**
 * Ticket service - handles ticket generation and management
 */

import { API, ERROR_MESSAGES } from '@/constants/config';
import { handleApiError } from '@/utils/errorHandler';
import type { GenerateTicketsResponse, StatsResponse, UserData } from '@/types';

/**
 * Generates tickets for a user
 */
export const generateTickets = async (
  reference: string,
  userData: UserData,
  ticketCount: number
): Promise<GenerateTicketsResponse> => {
  try {
    const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.GENERATE_TICKETS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reference, userData, ticketCount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || errorData.message || 'Error al generar tickets',
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const appError = handleApiError(error);
    
    return {
      success: false,
      error: appError.message || ERROR_MESSAGES.TICKETS_GENERATION_ERROR,
    };
  }
};

/**
 * Gets statistics about tickets
 */
export const getStats = async (): Promise<StatsResponse | null> => {
  try {
    const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.STATS}`, {
      method: 'GET',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

