// Mock prisma and rate limit before imports
import '../../../__tests__/setup';
import '../../../__tests__/helpers/rate-limit';

import request from 'supertest';
import { createTestApp } from '../../../__tests__/helpers/app';
import { testPrisma, cleanDatabase } from '../../../__tests__/setup';

describe('Public API - Validate Reference', () => {
  let app: any;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase();
    // Ensure database is clean before each test
  });

  describe('POST /validate-reference', () => {
    it('should validate existing and unused reference', async () => {
      // Use unique reference to avoid conflicts with other tests
      const uniqueRef = `123${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Create a reference
      await testPrisma.reference.create({
        data: {
          reference: uniqueRef,
          ticketCount: 5,
          ticketValue: 0,
          used: false,
        },
      });

      // Small delay to ensure reference is committed
      await new Promise(resolve => setTimeout(resolve, 50));

      const response = await request(app)
        .post('/validate-reference')
        .send({ reference: uniqueRef });

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
      expect(response.body.ticketCount).toBe(5);
    });

    it('should reject non-existent reference', async () => {
      const response = await request(app)
        .post('/validate-reference')
        .send({ reference: '999999' });

      expect(response.status).toBe(404);
      expect(response.body.valid).toBe(false);
      expect(response.body.message).toContain('no válido');
    });

    it('should reject already used reference', async () => {
      // Create and mark reference as used
      await testPrisma.reference.create({
        data: {
          reference: '123456',
          ticketCount: 5,
          ticketValue: 0,
          used: true,
          usedAt: new Date(),
        },
      });

      const response = await request(app)
        .post('/validate-reference')
        .send({ reference: '123456' });

      expect(response.status).toBe(400);
      expect(response.body.valid).toBe(false);
      expect(response.body.message).toContain('ya ha sido utilizado');
    });

    it('should validate reference format (6 digits)', async () => {
      const testCases = [
        { ref: '', expectedMessage: 'requerido' },
        { ref: '12345', expectedMessage: '6 dígitos' },
        { ref: '1234567', expectedMessage: '6 dígitos' },
        { ref: 'abc123', expectedMessage: '6 dígitos' },
      ];

      for (const { ref, expectedMessage } of testCases) {
        const response = await request(app)
          .post('/validate-reference')
          .send({ reference: ref });

        expect(response.status).toBe(400);
        expect(response.body.valid).toBe(false);
        expect(response.body.message).toContain(expectedMessage);
      }
    });

    it('should return correct ticketCount', async () => {
      // Use unique reference to avoid conflicts
      const uniqueRef = `123${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      await testPrisma.reference.create({
        data: {
          reference: uniqueRef,
          ticketCount: 10,
          ticketValue: 0,
          used: false,
        },
      });

      // Small delay to ensure reference is committed
      await new Promise(resolve => setTimeout(resolve, 50));

      const response = await request(app)
        .post('/validate-reference')
        .send({ reference: uniqueRef });

      expect(response.status).toBe(200);
      expect(response.body.ticketCount).toBe(10);
    });

    it('should handle reference with spaces and trim them', async () => {
      // Use unique reference to avoid conflicts
      const uniqueRef = `123${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      await testPrisma.reference.create({
        data: {
          reference: uniqueRef,
          ticketCount: 5,
          ticketValue: 0,
          used: false,
        },
      });

      // Small delay to ensure reference is committed
      await new Promise(resolve => setTimeout(resolve, 50));

      const response = await request(app)
        .post('/validate-reference')
        .send({ reference: `  ${uniqueRef}  ` });

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
    });
  });
});

