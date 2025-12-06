import { API } from '@/constants/config';

/**
 * Reference Service - Handles reference management operations
 */

const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3001' 
  : (import.meta.env.VITE_API_BASE_URL || API.BASE_URL);

export interface Reference {
  id: string;
  reference: string;
  ticketCount: number;
  ticketValue?: number | null;
  used: boolean;
  usedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReferenceData {
  reference: string;
  ticketCount: number;
  ticketValue?: number | null;
}

export interface UpdateReferenceData {
  ticketCount?: number;
  ticketValue?: number | null;
  used?: boolean;
}

export interface ReferenceListResponse {
  references: Reference[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get references with pagination and filters
 */
export const getReferences = async (
  page: number = 1,
  limit: number = 10,
  filters?: { used?: boolean; search?: string }
): Promise<ReferenceListResponse> => {
  try {
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

    const response = await fetch(`${API_BASE_URL}/admin/references?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('rifa_admin_auth')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener referencias');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching references:', error);
    throw new Error(error.message || 'Error al obtener referencias');
  }
};

/**
 * Create a new reference
 */
export const createReference = async (data: CreateReferenceData): Promise<Reference> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/references`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('rifa_admin_auth')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear referencia');
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error creating reference:', error);
    throw new Error(error.message || 'Error al crear referencia');
  }
};

/**
 * Update a reference
 */
export const updateReference = async (
  id: string,
  data: UpdateReferenceData
): Promise<Reference> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/references/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('rifa_admin_auth')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al actualizar referencia');
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error updating reference:', error);
    throw new Error(error.message || 'Error al actualizar referencia');
  }
};

/**
 * Delete a reference
 */
export const deleteReference = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/references/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('rifa_admin_auth')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al eliminar referencia');
    }

    return true;
  } catch (error: any) {
    console.error('Error deleting reference:', error);
    throw new Error(error.message || 'Error al eliminar referencia');
  }
};

/**
 * Bulk create references
 */
export const bulkCreateReferences = async (
  references: CreateReferenceData[]
): Promise<{ created: number; errors: string[] }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/references/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('rifa_admin_auth')}`,
      },
      body: JSON.stringify({ references }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear referencias');
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error bulk creating references:', error);
    throw new Error(error.message || 'Error al crear referencias');
  }
};

/**
 * Export references to CSV
 */
export const exportReferences = async (filters?: { used?: boolean }): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    if (filters?.used !== undefined) {
      params.append('used', filters.used.toString());
    }
    params.append('export', 'csv');

    const response = await fetch(`${API_BASE_URL}/admin/references/export?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('rifa_admin_auth')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al exportar referencias');
    }

    const blob = await response.blob();
    return blob;
  } catch (error: any) {
    console.error('Error exporting references:', error);
    throw new Error(error.message || 'Error al exportar referencias');
  }
};




