/**
 * Centralized TypeScript type definitions for Backoffice
 */

// Admin Types
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token?: string;
  user?: Omit<AdminUser, 'password'>;
  error?: string;
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  loading: boolean;
}

// Analytics Types
export interface DashboardStats {
  totalParticipants: number;
  activeParticipants: number;
  totalReferences: number;
  usedReferences: number;
  availableReferences: number;
  totalTickets: number;
  usedTickets: number;
  availableTickets: number;
  conversionRate: number; // Percentage
  // Estadísticas de valores
  totalValue?: number;
  usedValue?: number;
  availableValue?: number;
  averageTicketValue?: number;
  totalTicketsWithValue?: number;
  usedTicketsWithValue?: number;
  // Métricas de ingresos generados
  revenueToday?: number;
  revenueThisWeek?: number;
  revenueThisMonth?: number;
  totalRevenue?: number;
  projectedRevenue?: number;
}

export interface ParticipantStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface TicketStats {
  total: number;
  used: number;
  available: number;
  percentageUsed: number;
}

export interface RecentActivity {
  id: string;
  type: 'participant_registered' | 'reference_created' | 'reference_used';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Reference Types
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

export interface ReferenceFormData {
  reference: string;
  ticketCount: number;
  ticketValue?: number | null;
}

// Participant Types
export interface Participant {
  id: string;
  referenceId: string | null;
  name: string;
  email: string;
  phone: string;
  cedula: string;
  tickets: string[];
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Ticket Types
export interface Ticket {
  id: string;
  number: string;
  used: boolean;
  createdAt: string;
  updatedAt: string;
}
