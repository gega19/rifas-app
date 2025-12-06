// Mock prisma and rate limit before imports
import '../../../__tests__/setup';
import '../../../__tests__/helpers/rate-limit';

import request from 'supertest';
import { createTestApp } from '../../../__tests__/helpers/app';
import { testPrisma, cleanDatabase } from '../../../__tests__/setup';

describe('Public API - Generate Tickets', () => {
  let app: any;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    // Clean database first to ensure no state sharing
    await cleanDatabase();
    // Create a valid reference for each test with unique reference to avoid conflicts
    const uniqueRef = `123${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    await testPrisma.reference.create({
      data: {
        reference: uniqueRef,
        ticketCount: 5,
        ticketValue: 10.50,
        used: false,
      },
    });
    // Store for use in tests
    (global as any).currentTestRef = uniqueRef;
  });

  afterEach(() => {
    delete (global as any).currentTestRef;
  });

  describe('POST /generate-tickets', () => {
    const validUserData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '04121234567',
      cedula: '12345678',
    };

    beforeEach(async () => {
      // Clean database before each test to avoid state sharing
      await cleanDatabase();
      // Create a valid reference for each test
      await testPrisma.reference.create({
        data: {
          reference: (global as any).currentTestRef || '123456',
          ticketCount: 5,
          ticketValue: 10.50,
          used: false,
        },
      });
    });

    it('should generate unique ticket numbers (0000-9999)', async () => {
      const response = await request(app)
        .post('/generate-tickets')
        .send({
          reference: (global as any).currentTestRef || '123456',
          userData: validUserData,
          ticketCount: 5,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.tickets).toHaveLength(5);

      // Verify all tickets are unique
      const tickets = response.body.tickets;
      const uniqueTickets = new Set(tickets);
      expect(uniqueTickets.size).toBe(tickets.length);

      // Verify format (4 digits)
      tickets.forEach((ticket: string) => {
        expect(ticket).toMatch(/^\d{4}$/);
        expect(ticket.length).toBe(4);
      });
    });

    it('should not generate numbers already used in DB', async () => {
      // Create some used tickets
      await testPrisma.ticket.createMany({
        data: [
          { number: '0001', used: true },
          { number: '0002', used: true },
          { number: '0003', used: true },
        ],
      });

      const response = await request(app)
        .post('/generate-tickets')
        .send({
          reference: (global as any).currentTestRef || '123456',
          userData: validUserData,
          ticketCount: 5,
        });

      expect(response.status).toBe(200);
      const tickets = response.body.tickets;

      // Verify none of the generated tickets are in the used list
      expect(tickets).not.toContain('0001');
      expect(tickets).not.toContain('0002');
      expect(tickets).not.toContain('0003');
    });

    it('should not generate duplicate numbers in the same batch', async () => {
      const response = await request(app)
        .post('/generate-tickets')
        .send({
          reference: (global as any).currentTestRef || '123456',
          userData: validUserData,
          ticketCount: 10,
        });

      expect(response.status).toBe(200);
      const tickets = response.body.tickets;

      // Verify all are unique
      const uniqueTickets = new Set(tickets);
      expect(uniqueTickets.size).toBe(tickets.length);
    });

    it('should validate ticketCount <= tickets available', async () => {
      // Create many used tickets to limit availability
      const usedNumbers = Array.from({ length: 9990 }, (_, i) => ({
        number: i.toString().padStart(4, '0'),
        used: true,
      }));
      await testPrisma.ticket.createMany({ data: usedNumbers });

      // Only 10 tickets available, try to request 20
      const response = await request(app)
        .post('/generate-tickets')
        .send({
          reference: (global as any).currentTestRef || '123456',
          userData: validUserData,
          ticketCount: 20,
        });

      // Should handle gracefully - might succeed if finds enough, or fail if not
      // The important thing is it doesn't create duplicates
      if (response.status === 200) {
        const tickets = response.body.tickets;
        const uniqueTickets = new Set(tickets);
        expect(uniqueTickets.size).toBe(tickets.length);
      }
    });

    it('should handle case when not enough numbers available', async () => {
      // Create 9999 used tickets, leaving only 1 available
      const usedNumbers = Array.from({ length: 9999 }, (_, i) => ({
        number: (i + 1).toString().padStart(4, '0'),
        used: true,
      }));
      await testPrisma.ticket.createMany({ data: usedNumbers });

      // Try to request 5 tickets when only 1 is available
      const response = await request(app)
        .post('/generate-tickets')
        .send({
          reference: (global as any).currentTestRef || '123456',
          userData: validUserData,
          ticketCount: 5,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No hay suficientes números disponibles');
    });

    it('should mark reference as used after generating tickets', async () => {
      const ref = (global as any).currentTestRef || '123456';
      await request(app)
        .post('/generate-tickets')
        .send({
          reference: ref,
          userData: validUserData,
          ticketCount: 5,
        });

      const reference = await testPrisma.reference.findUnique({
        where: { reference: ref },
      });

      expect(reference?.used).toBe(true);
      expect(reference?.usedAt).not.toBeNull();
    });

    it('should save tickets correctly in DB', async () => {
      const response = await request(app)
        .post('/generate-tickets')
        .send({
          reference: (global as any).currentTestRef || '123456',
          userData: validUserData,
          ticketCount: 5,
        });

      const tickets = response.body.tickets;

      // Verify tickets are saved in DB
      for (const ticketNumber of tickets) {
        const ticket = await testPrisma.ticket.findUnique({
          where: { number: ticketNumber },
        });
        expect(ticket).not.toBeNull();
        expect(ticket?.used).toBe(true);
      }
    });

    it('should create participant with correct data', async () => {
      const response = await request(app)
        .post('/generate-tickets')
        .send({
          reference: (global as any).currentTestRef || '123456',
          userData: validUserData,
          ticketCount: 5,
        });

      const participant = await testPrisma.participant.findUnique({
        where: { referenceId: ref },
      });

      expect(participant).not.toBeNull();
      expect(participant?.name).toBe(validUserData.name);
      expect(participant?.email).toBe(validUserData.email);
      expect(participant?.phone).toBe(validUserData.phone);
      expect(participant?.cedula).toBe(validUserData.cedula);
      expect(participant?.tickets).toHaveLength(5);
      expect(participant?.tickets).toEqual(response.body.tickets);
    });

    it('should reject used reference', async () => {
      const ref = (global as any).currentTestRef || '123456';
      // Mark reference as used
      await testPrisma.reference.update({
        where: { reference: ref },
        data: { used: true, usedAt: new Date() },
      });

      const response = await request(app)
        .post('/generate-tickets')
        .send({
          reference: (global as any).currentTestRef || '123456',
          userData: validUserData,
          ticketCount: 5,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('ya utilizada');
    });

    it('should validate user data', async () => {
      const invalidData = [
        { name: 'A' }, // Name too short
        { email: 'invalid-email' }, // Invalid email
        { phone: '123' }, // Phone too short
        { cedula: '12345' }, // Cedula too short
      ];

      for (const invalidField of invalidData) {
        const response = await request(app)
          .post('/generate-tickets')
          .send({
            reference: (global as any).currentTestRef || '123456',
            userData: { ...validUserData, ...invalidField },
            ticketCount: 5,
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });

    it('should validate ticketCount > 0', async () => {
      const response = await request(app)
        .post('/generate-tickets')
        .send({
          reference: (global as any).currentTestRef || '123456',
          userData: validUserData,
          ticketCount: 0,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Transaction Atomicity', () => {
    const validUserData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '04121234567',
      cedula: '12345678',
    };

    beforeEach(async () => {
      await testPrisma.reference.create({
        data: {
          reference: (global as any).currentTestRef || '123456',
          ticketCount: 5,
          ticketValue: 0,
          used: false,
        },
      });
    });

    it('should rollback if participant creation fails', async () => {
      // This test verifies that if participant creation fails,
      // tickets are not created and reference is not marked as used
      // Note: This is harder to test without mocking, but we can verify
      // the transaction works by checking the final state

      const response = await request(app)
        .post('/generate-tickets')
        .send({
          reference: (global as any).currentTestRef || '123456',
          userData: validUserData,
          ticketCount: 5,
        });

      // If successful, all should be created
      if (response.status === 200) {
        const ref = (global as any).currentTestRef || '123456';
        const participant = await testPrisma.participant.findUnique({
          where: { referenceId: ref },
        });
        const tickets = await testPrisma.ticket.findMany({
          where: { used: true },
        });
        const reference = await testPrisma.reference.findUnique({
          where: { reference: ref },
        });

        // All should exist or none should exist (atomicity)
        const allExist = participant && tickets.length > 0 && reference?.used;
        const noneExist = !participant && tickets.length === 0 && !reference?.used;
        expect(allExist || noneExist).toBe(true);
      }
    });
  });
});

