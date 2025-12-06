import { API } from '@/constants/config';

const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3001' 
  : (import.meta.env.VITE_API_BASE_URL || API.BASE_URL);

export async function resetRaffle(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const token = localStorage.getItem('rifa_admin_auth');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_BASE_URL}/admin/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al reiniciar la rifa');
    }

    return data;
  } catch (error: any) {
    console.error('[Frontend] Error en resetRaffle:', error);
    throw error;
  }
}

