/**
 * Centralized TypeScript type definitions
 */

// User Data Types
export interface UserData {
  reference: string;
  name: string;
  phone: string;
  email: string;
  cedula: string;
}

// API Response Types
export interface ValidateReferenceResponse {
  valid: boolean;
  message?: string;
  ticketCount?: number;
}

export interface GenerateTicketsResponse {
  success: boolean;
  tickets?: string[];
  error?: string;
  message?: string;
}

export interface StatsResponse {
  totalTickets: number;
  used: number;
  available: number;
  percentageUsed: string;
}

// Participant Data Types
export interface ParticipantData extends UserData {
  tickets: string[];
  generatedAt: string;
}

// Reference Data Types
export interface ReferenceData {
  ticketCount: number;
  used: boolean;
  usedAt?: string;
}

// Ticket Types
export type TicketNumber = string; // 4-digit string (0000-9999)

// Form Validation Types
export interface FormErrors {
  reference?: string;
  name?: string;
  phone?: string;
  email?: string;
  cedula?: string;
}

// API Error Types
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}
