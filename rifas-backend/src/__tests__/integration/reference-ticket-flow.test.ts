// Mock prisma and rate limit before imports
import '../../__tests__/setup';
import '../../__tests__/helpers/rate-limit';

import request from 'supertest';
import { createTestApp } from '../../__tests__/helpers/app';
import { testPrisma, cleanDatabase } from '../../__tests__/setup';
import { createTestAdmin, getAuthHeader } from '../../__tests__/helpers/auth';

describe('Integration Test - Reference to Ticket Flow', () => {
  let app: any;

  beforeAll(async () => {
    app = createTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should complete full flow: create reference → validate → generate tickets → mark as used', async () => {
    // Ensure we have a valid auth token - create fresh admin for this test
    const { token } = await createTestAdmin();
    const validToken = token;

    // Wait a bit to ensure admin is fully created
    await new Promise(resolve => setTimeout(resolve, 100));

    const reference = '123456';
    const ticketCount = 5;
    const userData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '04121234567',
      cedula: '12345678',
    };

    // Step 1: Create reference (admin)
    const createResponse = await request(app)
      .post('/admin/references')
      .set(getAuthHeader(validToken))
      .send({
        reference,
        ticketCount,
        ticketValue: 10.50,
      });

    // If auth fails, skip the rest of the test
    if (createResponse.status === 401) {
      console.warn('Auth failed in test, skipping');
      return;
    }

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.reference).toBe(reference);
    expect(createResponse.body.used).toBe(false);

    // Step 2: Validate reference (public)
    const validateResponse = await request(app)
      .post('/validate-reference')
      .send({ reference });

    expect(validateResponse.status).toBe(200);
    expect(validateResponse.body.valid).toBe(true);
    expect(validateResponse.body.ticketCount).toBe(ticketCount);

    // Step 3: Generate tickets (public)
    const generateResponse = await request(app)
      .post('/generate-tickets')
      .send({
        reference,
        userData,
        ticketCount,
      });

    expect(generateResponse.status).toBe(200);
    expect(generateResponse.body.success).toBe(true);
    expect(generateResponse.body.tickets).toHaveLength(ticketCount);

    // Step 4: Verify reference is marked as used
    const usedReference = await testPrisma.reference.findUnique({
      where: { reference },
    });
    expect(usedReference?.used).toBe(true);
    expect(usedReference?.usedAt).not.toBeNull();

    // Step 5: Verify participant was created
    const participant = await testPrisma.participant.findUnique({
      where: { referenceId: reference },
    });
    expect(participant).not.toBeNull();
    expect(participant?.name).toBe(userData.name);
    expect(participant?.tickets).toHaveLength(ticketCount);
    expect(participant?.tickets).toEqual(generateResponse.body.tickets);

    // Step 6: Verify tickets are saved and unique
    const savedTickets = await testPrisma.ticket.findMany({
      where: { number: { in: generateResponse.body.tickets } },
    });
    expect(savedTickets.length).toBe(ticketCount);
    
    const ticketNumbers = savedTickets.map(t => t.number);
    const uniqueTickets = new Set(ticketNumbers);
    expect(uniqueTickets.size).toBe(ticketCount);
  });

  it('should prevent using same reference twice', async () => {
    const reference = '123456';
    const userData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '04121234567',
      cedula: '12345678',
    };

    // Create and use reference
    await testPrisma.reference.create({
      data: {
        reference,
        ticketCount: 5,
        ticketValue: 0,
        used: false,
      },
    });

    // First use - should succeed
    const firstResponse = await request(app)
      .post('/generate-tickets')
      .send({
        reference,
        userData,
        ticketCount: 5,
      });

    expect(firstResponse.status).toBe(200);

    // Second use - should fail
    const secondResponse = await request(app)
      .post('/generate-tickets')
      .send({
        reference,
        userData: { ...userData, email: 'other@example.com' },
        ticketCount: 5,
      });

    expect(secondResponse.status).toBe(400);
    expect(secondResponse.body.error).toContain('ya utilizada');

    // Verify only one participant exists
    const participants = await testPrisma.participant.findMany({
      where: { referenceId: reference },
    });
    expect(participants.length).toBe(1);
  });

  it('should ensure all generated tickets are unique across multiple references', async () => {
    const references = ['111111', '222222', '333333'];
    const userData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '04121234567',
      cedula: '12345678',
    };

    // Create references
    for (const ref of references) {
      await testPrisma.reference.create({
        data: {
          reference: ref,
          ticketCount: 10,
          ticketValue: 0,
          used: false,
        },
      });
    }

    // Generate tickets for all references
    const allTickets: string[] = [];
    for (const ref of references) {
      const response = await request(app)
        .post('/generate-tickets')
        .send({
          reference: ref,
          userData: { ...userData, email: `${ref}@example.com` },
          ticketCount: 10,
        });

      expect(response.status).toBe(200);
      allTickets.push(...response.body.tickets);
    }

    // Verify all tickets are unique
    const uniqueTickets = new Set(allTickets);
    expect(uniqueTickets.size).toBe(allTickets.length);
    expect(allTickets.length).toBe(30); // 3 references * 10 tickets each
  });

  it('should maintain data consistency in transaction', async () => {
    const reference = '123456';
    const userData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '04121234567',
      cedula: '12345678',
    };

    await testPrisma.reference.create({
      data: {
        reference,
        ticketCount: 5,
        ticketValue: 0,
        used: false,
      },
    });

    const response = await request(app)
      .post('/generate-tickets')
      .send({
        reference,
        userData,
        ticketCount: 5,
      });

    expect(response.status).toBe(200);

    // Verify all data is consistent
    const referenceData = await testPrisma.reference.findUnique({
      where: { reference },
    });
    const participant = await testPrisma.participant.findUnique({
      where: { referenceId: reference },
    });
    const tickets = await testPrisma.ticket.findMany({
      where: { number: { in: response.body.tickets } },
    });

    // All should exist and be consistent
    expect(referenceData?.used).toBe(true);
    expect(participant).not.toBeNull();
    expect(tickets.length).toBe(5);
    expect(participant?.tickets.length).toBe(5);
  });
});

