/**
 * Helper to reset rate limit for testing
 * Since rate limit is in-memory, we need to clear it between tests
 */

// Mock rate limit to always allow in tests
jest.mock('../../middleware/rateLimit', () => ({
  checkRateLimit: jest.fn(() => true),
}));

