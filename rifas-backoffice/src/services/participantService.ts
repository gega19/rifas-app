import { API } from '@/constants/config';
import type { ParticipantData } from '@/types';

/**
 * Participant Service - Handles participant management operations
 */

const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3001' 
  : (import.meta.env.VITE_API_BASE_URL || API.BASE_URL);

export interface Participant extends ParticipantData {
  id: string;
  referenceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantListResponse {
  participants: Participant[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get participants with pagination and filters
 */
export const getParticipants = async (
  page: number = 1,
  limit: number = 10,
  filters?: { search?: string; dateFrom?: string; dateTo?: string; referenceId?: string }
): Promise<ParticipantListResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo);
    }
    if (filters?.referenceId) {
      params.append('referenceId', filters.referenceId);
    }

    const response = await fetch(`${API_BASE_URL}/admin/participants?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('rifa_admin_auth')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener participantes');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching participants:', error);
    throw new Error(error.message || 'Error al obtener participantes');
  }
};

/**
 * Get participant by ID
 */
export const getParticipantById = async (id: string): Promise<Participant> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/participants/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('rifa_admin_auth')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener participante');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching participant:', error);
    throw new Error(error.message || 'Error al obtener participante');
  }
};

/**
 * Search participants
 */
export const searchParticipants = async (query: string): Promise<Participant[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/participants/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('rifa_admin_auth')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al buscar participantes');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error searching participants:', error);
    throw new Error(error.message || 'Error al buscar participantes');
  }
};

/**
 * Export participants to CSV
 */
export const exportParticipants = async (filters?: {
  dateFrom?: string;
  dateTo?: string;
  referenceId?: string;
}): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo);
    }
    if (filters?.referenceId) {
      params.append('referenceId', filters.referenceId);
    }
    params.append('export', 'csv');

    const response = await fetch(`${API_BASE_URL}/admin/participants/export?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('rifa_admin_auth')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al exportar participantes');
    }

    const blob = await response.blob();
    return blob;
  } catch (error: any) {
    console.error('Error exporting participants:', error);
    throw new Error(error.message || 'Error al exportar participantes');
  }
};




