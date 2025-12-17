import { Router } from 'express';
import type { Request, Response } from 'express';
import { verifyAdminAuth } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { validateEmail, validatePhone, validateCedula } from '../../utils/validators';

const router = Router();

// Get participants with pagination and filters
router.get('/', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    const referenceId = req.query.referenceId as string;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cedula: { contains: search, mode: 'insensitive' } },
        { referenceId: { contains: search } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    if (referenceId !== undefined) {
      if (referenceId === 'null' || referenceId === '') {
        where.referenceId = null;
      } else {
        where.referenceId = referenceId;
      }
    }

    const [participants, total] = await Promise.all([
      prisma.participant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reference: true,
        },
      }),
      prisma.participant.count({ where }),
    ]);

    return res.json({
      participants: participants.map((p) => ({
        id: p.id,
        referenceId: p.referenceId,
        name: p.name,
        email: p.email,
        phone: p.phone,
        cedula: p.cedula,
        tickets: p.tickets,
        generatedAt: p.generatedAt.toISOString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('Error fetching participants:', error);
    return res.status(500).json({ error: 'Error al obtener participantes' });
  }
});

// Create participant (with or without reference)
router.post('/', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { name, email, phone, cedula, ticketCount, referenceId } = req.body;

    // Validaciones básicas
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Nombre inválido' });
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (!phone || !validatePhone(phone)) {
      return res.status(400).json({ error: 'Teléfono inválido' });
    }

    if (!cedula || !validateCedula(cedula)) {
      return res.status(400).json({ error: 'Cédula inválida' });
    }

    const ticketsToGenerate = ticketCount || 5;
    if (typeof ticketsToGenerate !== 'number' || ticketsToGenerate < 1) {
      return res.status(400).json({ error: 'Cantidad de tickets inválida (debe ser mayor a 0)' });
    }

    // Si se proporciona referencia, validarla
    if (referenceId) {
      if (typeof referenceId !== 'string' || referenceId.length !== 6 || !/^\d{6}$/.test(referenceId)) {
        return res.status(400).json({ error: 'Referencia inválida' });
      }

      const refData = await prisma.reference.findUnique({
        where: { reference: referenceId },
      });

      if (!refData) {
        return res.status(400).json({ error: 'Referencia no encontrada' });
      }

      if (refData.used) {
        return res.status(400).json({ error: 'Referencia ya utilizada' });
      }
    }

    // Verificar que el email o cédula no estén duplicados
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        OR: [
          { email },
          { cedula },
        ],
      },
    });

    if (existingParticipant) {
      return res.status(400).json({ 
        error: 'Ya existe un participante con este email o cédula' 
      });
    }

    // Obtener números de tickets ya usados
    const usedTickets = await prisma.ticket.findMany({
      where: { used: true },
      select: { number: true },
    });
    const usedTicketNumbers = new Set(usedTickets.map(t => t.number));

    // Generar números únicos
    const generatedTickets: string[] = [];
    const maxAttempts = 10000;
    let attempts = 0;

    while (generatedTickets.length < ticketsToGenerate && attempts < maxAttempts) {
      const randomNumber = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      
      if (!usedTicketNumbers.has(randomNumber) && !generatedTickets.includes(randomNumber)) {
        generatedTickets.push(randomNumber);
        usedTicketNumbers.add(randomNumber);
      }
      attempts++;
    }

    if (generatedTickets.length < ticketsToGenerate) {
      return res.status(400).json({ 
        error: 'No hay suficientes números disponibles' 
      });
    }

    // Crear participante y tickets en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear participante
      const participant = await tx.participant.create({
        data: {
          referenceId: referenceId || null,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          cedula: cedula.trim(),
          tickets: generatedTickets,
        },
      });

      // Crear tickets individuales
      await tx.ticket.createMany({
        data: generatedTickets.map(num => ({ number: num, used: true })),
        skipDuplicates: true,
      });

      // Si hay referencia, marcarla como usada
      if (referenceId) {
        await tx.reference.update({
          where: { reference: referenceId },
          data: { used: true, usedAt: new Date() },
        });
      }

      return participant;
    });

    return res.json({
      id: result.id,
      referenceId: result.referenceId,
      name: result.name,
      email: result.email,
      phone: result.phone,
      cedula: result.cedula,
      tickets: result.tickets,
      generatedAt: result.generatedAt.toISOString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Error creating participant:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ya existe un participante con estos datos' });
    }
    return res.status(500).json({ error: 'Error al crear participante' });
  }
});

// Get participant by ID
router.get('/:id', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const participant = await prisma.participant.findUnique({
      where: { id },
      include: {
        reference: true,
      },
    });

    if (!participant) {
      return res.status(404).json({ error: 'Participante no encontrado' });
    }

    return res.json({
      id: participant.id,
      referenceId: participant.referenceId,
      name: participant.name,
      email: participant.email,
      phone: participant.phone,
      cedula: participant.cedula,
      tickets: participant.tickets,
      generatedAt: participant.generatedAt.toISOString(),
      createdAt: participant.createdAt.toISOString(),
      updatedAt: participant.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching participant:', error);
    return res.status(500).json({ error: 'Error al obtener participante' });
  }
});

// Search participants
router.get('/search', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res.json([]);
    }

    const participants = await prisma.participant.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { cedula: { contains: query, mode: 'insensitive' } },
          { referenceId: { contains: query } },
        ],
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return res.json(
      participants.map((p) => ({
        id: p.id,
        referenceId: p.referenceId,
        name: p.name,
        email: p.email,
        phone: p.phone,
        cedula: p.cedula,
        tickets: p.tickets,
        generatedAt: p.generatedAt.toISOString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))
    );
  } catch (error: any) {
    console.error('Error searching participants:', error);
    return res.status(500).json({ error: 'Error al buscar participantes' });
  }
});

// Export participants to CSV
router.get('/export', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    const referenceId = req.query.referenceId as string;

    const where: any = {};

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    if (referenceId !== undefined) {
      if (referenceId === 'null' || referenceId === '') {
        where.referenceId = null;
      } else {
        where.referenceId = referenceId;
      }
    }

    const participants = await prisma.participant.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const headers = ['Nombre', 'Email', 'Teléfono', 'Cédula', 'Referencia', 'Tickets', 'Fecha Registro'];
    const rows = participants.map((p) => [
      p.name,
      p.email,
      p.phone,
      p.cedula,
      p.referenceId || 'Sin referencia',
      p.tickets.join('; '),
      new Date(p.generatedAt).toLocaleString('es-VE'),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=participantes-${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);
  } catch (error: any) {
    console.error('Error exporting participants:', error);
    return res.status(500).json({ error: 'Error al exportar participantes' });
  }
});

export default router;


