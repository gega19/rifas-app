export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s-()]/g, '');
  return /^\d{7,15}$/.test(cleaned);
};

export const validateCedula = (cedula: string): boolean => {
  const cleaned = cedula.replace(/^[VE]-?/i, '');
  return /^\d{6,8}$/.test(cleaned);
};

export const validateReference = (reference: string): boolean => {
  return reference.length === 6 && /^\d{6}$/.test(reference);
};

export const validateTicketNumber = (number: string): boolean => {
  return number.length === 4 && /^\d{4}$/.test(number);
};


