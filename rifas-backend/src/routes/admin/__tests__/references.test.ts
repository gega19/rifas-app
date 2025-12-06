// Mock prisma and rate limit before imports
import '../../../__tests__/setup';
import '../../../__tests__/helpers/rate-limit';

import request from 'supertest';
import { createTestApp } from '../../../__tests__/helpers/app';
import { testPrisma, cleanDatabase } from '../../../__tests__/setup';
import { createTestAdmin, getAuthHeader } from '../../../__tests__/helpers/auth';

describe('Admin References API', () => {
  let app: any;

  beforeAll(async () => {
    app = createTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /admin/references', () => {
    it('should create a reference with valid format (6 digits)', async () => {
      // Ensure we have a valid auth token
      const { token } = await createTestAdmin();
      const validToken = token;

      const response = await request(app)
        .post('/admin/references')
        .set(getAuthHeader(validToken))
        .send({
          reference: '123456',
          ticketCount: 5,
          ticketValue: 10.50,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.reference).toBe('123456');
      expect(response.body.ticketCount).toBe(5);
      expect(Number(response.body.ticketValue)).toBe(10.50);
      expect(response.body.used).toBe(false);
    });

    it('should reject duplicate reference (P2002 error)', async () => {
      // Create first reference
      await testPrisma.reference.create({
        data: {
          reference: '123456',
          ticketCount: 5,
          ticketValue: 0,
          used: false,
        },
      });

      // Try to create duplicate
      const response = await request(app)
        .post('/admin/references')
        .set(getAuthHeader((await createTestAdmin()).token))
        .send({
          reference: '123456',
          ticketCount: 10,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Esta referencia ya existe');
    });

    it('should validate reference format (must be 6 digits)', async () => {
      // Ensure we have a valid auth token
      const { token } = await createTestAdmin();
      const validToken = token;

      const invalidReferences = ['12345', '1234567', 'abc123', '12-3456', ''];

      for (const ref of invalidReferences) {
        const response = await request(app)
          .post('/admin/references')
          .set(getAuthHeader(validToken))
          .send({
            reference: ref,
            ticketCount: 5,
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Referencia inválida');
      }
    });

    it('should validate ticketCount > 0', async () => {
      const { token } = await createTestAdmin();
      const response = await request(app)
        .post('/admin/references')
        .set(getAuthHeader(token))
        .send({
          reference: '123456',
          ticketCount: 0,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Cantidad de tickets inválida');
    });

    it('should validate ticketValue >= 0', async () => {
      const { token } = await createTestAdmin();
      const response = await request(app)
        .post('/admin/references')
        .set(getAuthHeader(token))
        .send({
          reference: '123456',
          ticketCount: 5,
          ticketValue: -10,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Valor del ticket inválido');
    });

    it('should create reference with default ticketValue (0) when not provided', async () => {
      const { token } = await createTestAdmin();
      const response = await request(app)
        .post('/admin/references')
        .set(getAuthHeader(token))
        .send({
          reference: '123456',
          ticketCount: 5,
        });

      expect(response.status).toBe(200);
      expect(Number(response.body.ticketValue)).toBe(0);
    });
  });

  describe('POST /admin/references/bulk', () => {
    it('should create multiple valid references', async () => {
      const references = [
        { reference: '111111', ticketCount: 5, ticketValue: 10 },
        { reference: '222222', ticketCount: 10, ticketValue: 20 },
        { reference: '333333', ticketCount: 3 },
      ];

      const response = await request(app)
        .post('/admin/references/bulk')
        .set(getAuthHeader((await createTestAdmin()).token))
        .send({ references });

      expect(response.status).toBe(200);
      expect(response.body.created).toBe(3);
      expect(response.body.errors).toHaveLength(0);
    });

    it('should reject duplicate references in the same batch', async () => {
      const { token } = await createTestAdmin();
      const references = [
        { reference: '111111', ticketCount: 5 },
        { reference: '111111', ticketCount: 10 }, // Duplicate in batch
        { reference: '222222', ticketCount: 3 },
      ];

      const response = await request(app)
        .post('/admin/references/bulk')
        .set(getAuthHeader(token))
        .send({ references });

      // First one should be created, second should fail
      expect(response.body.created).toBeGreaterThanOrEqual(1);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(response.body.errors.some((e: string) => e.includes('ya existe'))).toBe(true);
    });

    it('should reject references that already exist in DB', async () => {
      const { token } = await createTestAdmin();
      // Create reference in DB
      await testPrisma.reference.create({
        data: {
          reference: '111111',
          ticketCount: 5,
          ticketValue: 0,
          used: false,
        },
      });

      const references = [
        { reference: '111111', ticketCount: 10 }, // Already exists
        { reference: '222222', ticketCount: 5 },
      ];

      const response = await request(app)
        .post('/admin/references/bulk')
        .set(getAuthHeader(token))
        .send({ references });

      expect(response.body.created).toBe(1); // Only second one created
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(response.body.errors.some((e: string) => e.includes('111111') && e.includes('ya existe'))).toBe(true);
    });

    it('should report individual errors without failing entire batch', async () => {
      const { token } = await createTestAdmin();
      const references = [
        { reference: '111111', ticketCount: 5 }, // Valid
        { reference: '12345', ticketCount: 5 }, // Invalid format
        { reference: '222222', ticketCount: 0 }, // Invalid ticketCount
        { reference: '333333', ticketCount: 5 }, // Valid
      ];

      const response = await request(app)
        .post('/admin/references/bulk')
        .set(getAuthHeader(token))
        .send({ references });

      expect(response.body.created).toBe(2); // Two valid ones
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should validate all reference fields in bulk', async () => {
      const { token } = await createTestAdmin();
      const references = [
        { reference: '111111', ticketCount: 5, ticketValue: -10 }, // Invalid ticketValue
        { reference: 'abc123', ticketCount: 5 }, // Invalid format
      ];

      const response = await request(app)
        .post('/admin/references/bulk')
        .set(getAuthHeader(token))
        .send({ references });

      expect(response.body.created).toBe(0);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Race Condition Tests', () => {
    it('should prevent duplicate references in concurrent requests', async () => {
      const reference = '999999';
      const ticketCount = 5;

      const { token } = await createTestAdmin();
      // Simulate concurrent requests
      const promises = Array.from({ length: 5 }, () =>
        request(app)
          .post('/admin/references')
          .set(getAuthHeader(token))
          .send({ reference, ticketCount })
      );

      const responses = await Promise.all(promises);

      // Only one should succeed
      const successful = responses.filter(r => r.status === 200);
      const failed = responses.filter(r => r.status === 400);

      expect(successful.length).toBe(1);
      expect(failed.length).toBe(4);
      failed.forEach(response => {
        expect(response.body.error).toBe('Esta referencia ya existe');
      });

      // Verify only one reference exists in DB
      const count = await testPrisma.reference.count({
        where: { reference },
      });
      expect(count).toBe(1);
    });
  });

  describe('GET /admin/references', () => {
    it('should return paginated references', async () => {
      // Create test references
      await testPrisma.reference.createMany({
        data: [
          { reference: '111111', ticketCount: 5, ticketValue: 0, used: false },
          { reference: '222222', ticketCount: 10, ticketValue: 0, used: false },
          { reference: '333333', ticketCount: 3, ticketValue: 0, used: true },
        ],
      });

      const { token } = await createTestAdmin();
      const response = await request(app)
        .get('/admin/references?page=1&limit=10')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('references');
      expect(response.body).toHaveProperty('total');
      expect(response.body.references.length).toBeGreaterThan(0);
    });
  });
});

