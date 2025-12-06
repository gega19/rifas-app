import { PrismaClient } from '@prisma/client';

// Get test database URL from environment or use default
const testDatabaseUrl = process.env.DATABASE_URL || 
  'postgresql://postgres:postgres@localhost:5434/rifa_db_test?schema=public';

// Create a separate Prisma client for testing
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: testDatabaseUrl,
    },
  },
  log: process.env.DEBUG ? ['query', 'error', 'warn'] : ['error'],
});

// Mock prisma in config/database to use testPrisma during tests
jest.mock('../config/database', () => ({
  prisma: testPrisma,
}));

// Clean database before each test
export async function cleanDatabase() {
  // Delete in order to respect foreign key constraints
  await testPrisma.participant.deleteMany();
  await testPrisma.ticket.deleteMany();
  await testPrisma.reference.deleteMany();
  await testPrisma.adminUser.deleteMany();
}

// Setup before all tests
beforeAll(async () => {
  // Ensure database is clean at the start
  await cleanDatabase();
});

// Clean after each test
afterEach(async () => {
  await cleanDatabase();
});

// Close connection after all tests
afterAll(async () => {
  await testPrisma.$disconnect();
});
