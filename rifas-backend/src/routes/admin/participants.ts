import { Router } from 'express';
import type { Request, Response } from 'express';
import { verifyAdminAuth } from '../../middleware/auth';
import { prisma } from '../../config/database';

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

    if (referenceId) {
      where.referenceId = referenceId;
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

    if (referenceId) {
      where.referenceId = referenceId;
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
      p.referenceId,
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


