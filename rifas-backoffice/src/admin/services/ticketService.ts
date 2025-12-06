import { API } from '@/constants/config';
import type { TicketStats } from '@/types';

/**
 * Ticket Service - Handles ticket management operations
 */

const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3001' 
  : (import.meta.env.VITE_API_BASE_URL || API.BASE_URL);

export interface Ticket {
  id: string;
  number: string;
  used: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get tickets with pagination and filters
 */
export const getTickets = async (
  page: number = 1,
  limit: number = 50,
  filters?: { used?: boolean; search?: string }
): Promise<TicketListResponse> => {
  try {
    const token = localStorage.getItem('rifa_admin_auth');
    if (!token || token === 'null' || token === 'undefined') {
      throw new Error('No hay token de autenticación. Por favor inicia sesión nuevamente.');
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.used !== undefined) {
      params.append('used', filters.used.toString());
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const response = await fetch(`${API_BASE_URL}/admin/tickets?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      console.error('Error response:', response.status, errorData);
      throw new Error(errorData.error || errorData.message || `Error al obtener tickets (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    throw new Error(error.message || 'Error al obtener tickets');
  }
};

/**
 * Get ticket statistics
 */
export const getTicketStats = async (): Promise<TicketStats> => {
  try {
    const token = localStorage.getItem('rifa_admin_auth');
    if (!token || token === 'null' || token === 'undefined') {
      throw new Error('No hay token de autenticación. Por favor inicia sesión nuevamente.');
    }

    const response = await fetch(`${API_BASE_URL}/admin/tickets/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      console.error('Error response:', response.status, errorData);
      throw new Error(errorData.error || errorData.message || `Error al obtener estadísticas de tickets (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching ticket stats:', error);
    throw new Error(error.message || 'Error al obtener estadísticas de tickets');
  }
};

/**
 * Search ticket by number
 */
export const searchTicket = async (number: string): Promise<Ticket | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tickets/${number}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('rifa_admin_auth')}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Error al buscar ticket');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error searching ticket:', error);
    throw new Error(error.message || 'Error al buscar ticket');
  }
};

/**
 * Get ticket distribution data for charts
 */
export const getTicketDistribution = async (): Promise<Array<{ name: string; value: number }>> => {
  try {
    const token = localStorage.getItem('rifa_admin_auth');
    if (!token || token === 'null' || token === 'undefined') {
      throw new Error('No hay token de autenticación. Por favor inicia sesión nuevamente.');
    }

    const response = await fetch(`${API_BASE_URL}/admin/tickets/distribution`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      console.error('Error response:', response.status, errorData);
      throw new Error(errorData.error || errorData.message || `Error al obtener distribución de tickets (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching ticket distribution:', error);
    throw new Error(error.message || 'Error al obtener distribución de tickets');
  }
};




