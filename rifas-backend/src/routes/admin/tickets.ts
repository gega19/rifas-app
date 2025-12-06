import { Router } from 'express';
import type { Request, Response } from 'express';
import { verifyAdminAuth } from '../../middleware/auth';
import { prisma } from '../../config/database';

const router = Router();

// IMPORTANTE: Las rutas específicas deben ir ANTES de las rutas con parámetros
// para que Express no las interprete como parámetros

// Get ticket statistics
router.get('/stats', verifyAdminAuth, async (_req: Request, res: Response) => {
  try {
    const usedTickets = await prisma.ticket.count({
      where: { used: true },
    });
    const totalTickets = 10000;
    const availableTickets = totalTickets - usedTickets;
    const percentageUsed = (usedTickets / totalTickets) * 100;

    return res.json({
      total: totalTickets,
      used: usedTickets,
      available: availableTickets,
      percentageUsed: parseFloat(percentageUsed.toFixed(2)),
    });
  } catch (error: any) {
    console.error('Error fetching ticket stats:', error);
    return res.status(500).json({ error: 'Error al obtener estadísticas de tickets' });
  }
});

// Get ticket distribution
router.get('/distribution', verifyAdminAuth, async (_req: Request, res: Response) => {
  try {
    const usedTickets = await prisma.ticket.count({
      where: { used: true },
    });
    const totalTickets = 10000;
    const availableTickets = totalTickets - usedTickets;

    return res.json([
      { name: 'Usados', value: usedTickets },
      { name: 'Disponibles', value: availableTickets },
    ]);
  } catch (error: any) {
    console.error('Error fetching ticket distribution:', error);
    return res.status(500).json({ error: 'Error al obtener distribución de tickets' });
  }
});

// Get tickets with pagination and filters
router.get('/', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const used = req.query.used === 'true' ? true : req.query.used === 'false' ? false : undefined;
    const search = req.query.search as string;

    const where: any = {};
    if (used !== undefined) {
      where.used = used;
    }
    if (search) {
      where.number = { contains: search };
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ticket.count({ where }),
    ]);

    return res.json({
      tickets: tickets.map((t) => ({
        id: t.id,
        number: t.number,
        used: t.used,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ error: 'Error al obtener tickets' });
  }
});

// Get ticket by number (debe ir al final para no capturar rutas específicas)
router.get('/:number', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { number } = req.params;

    if (number.length !== 4 || !/^\d{4}$/.test(number)) {
      return res.status(400).json({ error: 'Número de ticket inválido' });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { number },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    return res.json({
      id: ticket.id,
      number: ticket.number,
      used: ticket.used,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching ticket:', error);
    return res.status(500).json({ error: 'Error al obtener ticket' });
  }
});

export default router;


