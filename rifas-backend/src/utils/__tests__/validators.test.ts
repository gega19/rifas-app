import {
  validateEmail,
  validatePhone,
  validateCedula,
  validateReference,
  validateTicketNumber,
} from '../validators';

describe('Validators', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('invalid@.com')).toBe(false);
      expect(validateEmail('invalid@com')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhone('04121234567')).toBe(true);
      expect(validatePhone('0424-123-4567')).toBe(true);
      expect(validatePhone('(0412) 123-4567')).toBe(true);
      expect(validatePhone('0412 123 4567')).toBe(true);
      expect(validatePhone('1234567890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('12345')).toBe(false); // Too short
      expect(validatePhone('1234567890123456')).toBe(false); // Too long
      expect(validatePhone('abc1234567')).toBe(false); // Contains letters
    });
  });

  describe('validateCedula', () => {
    it('should validate correct cedula formats', () => {
      expect(validateCedula('12345678')).toBe(true);
      expect(validateCedula('1234567')).toBe(true);
      expect(validateCedula('123456')).toBe(true);
      expect(validateCedula('V-12345678')).toBe(true);
      expect(validateCedula('E-12345678')).toBe(true);
      expect(validateCedula('v12345678')).toBe(true);
      expect(validateCedula('e12345678')).toBe(true);
    });

    it('should reject invalid cedula formats', () => {
      expect(validateCedula('12345')).toBe(false); // Too short
      expect(validateCedula('123456789')).toBe(false); // Too long
      expect(validateCedula('abc12345')).toBe(false); // Contains letters in wrong place
    });
  });

  describe('validateReference', () => {
    it('should validate correct reference format (6 digits)', () => {
      expect(validateReference('123456')).toBe(true);
      expect(validateReference('000000')).toBe(true);
      expect(validateReference('999999')).toBe(true);
    });

    it('should reject invalid reference formats', () => {
      expect(validateReference('12345')).toBe(false); // Too short
      expect(validateReference('1234567')).toBe(false); // Too long
      expect(validateReference('12345a')).toBe(false); // Contains letter
      expect(validateReference('abc123')).toBe(false); // Contains letters
      expect(validateReference('')).toBe(false); // Empty
    });
  });

  describe('validateTicketNumber', () => {
    it('should validate correct ticket number format (4 digits)', () => {
      expect(validateTicketNumber('0000')).toBe(true);
      expect(validateTicketNumber('1234')).toBe(true);
      expect(validateTicketNumber('9999')).toBe(true);
    });

    it('should reject invalid ticket number formats', () => {
      expect(validateTicketNumber('123')).toBe(false); // Too short
      expect(validateTicketNumber('12345')).toBe(false); // Too long
      expect(validateTicketNumber('123a')).toBe(false); // Contains letter
      expect(validateTicketNumber('abc1')).toBe(false); // Contains letters
      expect(validateTicketNumber('')).toBe(false); // Empty
    });
  });
});

