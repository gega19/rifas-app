import { testPrisma } from '../setup';

/**
 * Mock Prisma client for testing
 * This allows routes to use testPrisma instead of the production prisma
 */
export function setupPrismaMock() {
  // Mock the prisma import in routes
  jest.mock('../../config/database', () => ({
    prisma: testPrisma,
  }));
}

