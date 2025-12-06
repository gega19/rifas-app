import { testPrisma } from '../setup';
import * as bcrypt from 'bcryptjs';

/**
 * Create a test admin user and return auth token
 */
export async function createTestAdmin() {
  // Always create a new admin with unique username to avoid conflicts
  const uniqueUsername = `testadmin_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const hashedPassword = await bcrypt.hash('test123', 10);
  
  const admin = await testPrisma.adminUser.create({
    data: {
      username: uniqueUsername,
      email: `test_${Date.now()}@admin.com`,
      password: hashedPassword,
      role: 'admin',
    },
  });

  // Create token - the middleware expects just the admin ID in base64
  // The middleware decodes and extracts the ID part before the colon
  const token = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64');

  return { admin, token };
}

/**
 * Generate auth header for testing
 */
export function getAuthHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

