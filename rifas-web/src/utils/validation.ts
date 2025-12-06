/**
 * Validation utilities for form inputs and data
 */

import { REFERENCE, VALIDATION_PATTERNS, ERROR_MESSAGES } from '@/constants/config';
import type { UserData, FormErrors } from '@/types';

/**
 * Validates a reference number
 */
export const validateReference = (reference: string): { valid: boolean; error?: string } => {
  if (!reference) {
    return { valid: false, error: ERROR_MESSAGES.REFERENCE_INVALID };
  }

  if (reference.length !== REFERENCE.LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.REFERENCE_INVALID };
  }

  if (!REFERENCE.PATTERN.test(reference)) {
    return { valid: false, error: ERROR_MESSAGES.REFERENCE_INVALID };
  }

  return { valid: true };
};

/**
 * Validates an email address
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: ERROR_MESSAGES.FIELDS_REQUIRED };
  }

  if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
    return { valid: false, error: ERROR_MESSAGES.EMAIL_INVALID };
  }

  return { valid: true };
};

/**
 * Validates a phone number
 */
export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone) {
    return { valid: false, error: ERROR_MESSAGES.FIELDS_REQUIRED };
  }

  // Remove spaces, dashes, and parentheses for validation
  const cleanedPhone = phone.replace(/[\s-()]/g, '');
  
  // Check if it has at least 7 digits (minimum phone number length)
  if (!/^\d{7,15}$/.test(cleanedPhone)) {
    return { valid: false, error: ERROR_MESSAGES.PHONE_INVALID };
  }

  return { valid: true };
};

/**
 * Validates a Venezuelan ID (cédula)
 */
export const validateCedula = (cedula: string): { valid: boolean; error?: string } => {
  if (!cedula) {
    return { valid: false, error: ERROR_MESSAGES.FIELDS_REQUIRED };
  }

  // Accept both with and without V- prefix
  const cleanedCedula = cedula.replace(/^[VE]-?/i, '');
  
  // Should have 6-8 digits
  if (!/^\d{6,8}$/.test(cleanedCedula)) {
    return { valid: false, error: ERROR_MESSAGES.CEDULA_INVALID };
  }

  return { valid: true };
};

/**
 * Validates a name (non-empty, reasonable length)
 */
export const validateName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: ERROR_MESSAGES.FIELDS_REQUIRED };
  }

  if (name.trim().length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }

  if (name.length > 100) {
    return { valid: false, error: 'El nombre es demasiado largo' };
  }

  return { valid: true };
};

/**
 * Validates all user data fields
 */
export const validateUserData = (userData: Partial<UserData>): { valid: boolean; errors: FormErrors } => {
  const errors: FormErrors = {};

  // Validate reference
  if (userData.reference !== undefined) {
    const refValidation = validateReference(userData.reference);
    if (!refValidation.valid) {
      errors.reference = refValidation.error;
    }
  }

  // Validate name
  if (userData.name !== undefined) {
    const nameValidation = validateName(userData.name);
    if (!nameValidation.valid) {
      errors.name = nameValidation.error;
    }
  }

  // Validate email
  if (userData.email !== undefined) {
    const emailValidation = validateEmail(userData.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error;
    }
  }

  // Validate phone
  if (userData.phone !== undefined) {
    const phoneValidation = validatePhone(userData.phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.error;
    }
  }

  // Validate cedula
  if (userData.cedula !== undefined) {
    const cedulaValidation = validateCedula(userData.cedula);
    if (!cedulaValidation.valid) {
      errors.cedula = cedulaValidation.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates complete user data (all fields required)
 */
export const validateCompleteUserData = (userData: Partial<UserData>): { valid: boolean; errors: FormErrors } => {
  // Check all required fields are present
  if (!userData.reference || !userData.name || !userData.email || !userData.phone || !userData.cedula) {
    return {
      valid: false,
      errors: { reference: ERROR_MESSAGES.FIELDS_REQUIRED },
    };
  }

  return validateUserData(userData);
};

