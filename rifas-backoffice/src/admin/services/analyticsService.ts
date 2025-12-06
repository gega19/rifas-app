import { API } from '@/constants/config';
import type { DashboardStats, ParticipantStats, TicketStats, RecentActivity } from '@/types';

/**
 * Analytics Service - Handles all analytics and dashboard data
 */

const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3001' 
  : (import.meta.env.VITE_API_BASE_URL || API.BASE_URL);

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('rifa_admin_auth')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener estadísticas del dashboard');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error(error.message || 'Error al obtener estadísticas');
  }
};

/**
 * Get participant statistics
 */
export const getParticipantStats = async (): Promise<ParticipantStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/participants`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('rifa_admin_auth')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener estadísticas de participantes');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching participant stats:', error);
    throw new Error(error.message || 'Error al obtener estadísticas de participantes');
  }
};

/**
 * Get ticket statistics
 */
export const getTicketStats = async (): Promise<TicketStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/tickets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('rifa_admin_auth')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener estadísticas de tickets');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching ticket stats:', error);
    throw new Error(error.message || 'Error al obtener estadísticas de tickets');
  }
};

/**
 * Get recent activity
 */
export const getRecentActivity = async (limit: number = 10): Promise<RecentActivity[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/activity?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('rifa_admin_auth')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener actividad reciente');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching recent activity:', error);
    throw new Error(error.message || 'Error al obtener actividad reciente');
  }
};




