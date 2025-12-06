import { Router } from 'express';
import type { Request, Response } from 'express';
import { verifyAdminAuth } from '../../middleware/auth';
import { prisma } from '../../config/database';

const router = Router();

// Dashboard Stats
router.get('/dashboard', verifyAdminAuth, async (_req: Request, res: Response) => {
  try {
    const [
      totalParticipants,
      totalReferences,
      usedReferences,
      usedTickets,
      allReferences,
      participants,
    ] = await Promise.all([
      prisma.participant.count(),
      prisma.reference.count(),
      prisma.reference.count({ where: { used: true } }),
      prisma.ticket.count({ where: { used: true } }),
      prisma.reference.findMany({
        select: {
          ticketCount: true,
          ticketValue: true,
          used: true,
          usedAt: true,
        },
      }),
      prisma.participant.findMany({
        select: {
          createdAt: true,
          referenceId: true,
          reference: {
            select: {
              ticketValue: true,
              ticketCount: true,
            },
          },
        },
      }),
    ]);

    const availableTickets = 10000 - usedTickets;
    const conversionRate = totalReferences > 0 
      ? (usedReferences / totalReferences) * 100 
      : 0;

    // Calcular estadísticas de valores
    let totalValue = 0;
    let usedValue = 0;
    let totalTicketsWithValue = 0;
    let usedTicketsWithValue = 0;

    allReferences.forEach((ref) => {
      const value = ref.ticketValue ? Number(ref.ticketValue) : 0;
      const refTotalValue = value * ref.ticketCount;
      totalValue += refTotalValue;
      totalTicketsWithValue += ref.ticketCount;

      if (ref.used) {
        usedValue += refTotalValue;
        usedTicketsWithValue += ref.ticketCount;
      }
    });

    // Calcular ingresos por período
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    let revenueToday = 0;
    let revenueThisWeek = 0;
    let revenueThisMonth = 0;
    let totalRevenue = 0;

    participants.forEach((participant) => {
      if (participant.reference?.ticketValue && participant.reference.ticketCount) {
        const value = Number(participant.reference.ticketValue);
        const refRevenue = value * participant.reference.ticketCount;
        totalRevenue += refRevenue;

        const participantDate = new Date(participant.createdAt);
        if (participantDate >= today) {
          revenueToday += refRevenue;
        }
        if (participantDate >= weekAgo) {
          revenueThisWeek += refRevenue;
        }
        if (participantDate >= monthAgo) {
          revenueThisMonth += refRevenue;
        }
      }
    });

    // Calcular proyección de ingresos (basado en tasa de conversión)
    const projectedRevenue = conversionRate > 0 
      ? Number((totalRevenue * (100 / conversionRate)).toFixed(2))
      : totalRevenue;

    const stats = {
      totalParticipants,
      activeParticipants: totalParticipants, // Por ahora igual al total
      totalReferences,
      usedReferences,
      availableReferences: totalReferences - usedReferences,
      totalTickets: 10000,
      usedTickets,
      availableTickets,
      conversionRate,
      // Estadísticas de valores
      totalValue: Number(totalValue.toFixed(2)),
      usedValue: Number(usedValue.toFixed(2)),
      availableValue: Number((totalValue - usedValue).toFixed(2)),
      averageTicketValue: totalTicketsWithValue > 0 
        ? Number((totalValue / totalTicketsWithValue).toFixed(2))
        : 0,
      totalTicketsWithValue,
      usedTicketsWithValue,
      // Métricas de ingresos generados
      revenueToday: Number(revenueToday.toFixed(2)),
      revenueThisWeek: Number(revenueThisWeek.toFixed(2)),
      revenueThisMonth: Number(revenueThisMonth.toFixed(2)),
      totalRevenue: Number(totalRevenue.toFixed(2)),
      projectedRevenue: Number(projectedRevenue.toFixed(2)),
    };

    return res.json(stats);
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
});

// Participant Stats
router.get('/participants', verifyAdminAuth, async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [total, todayCount, weekCount, monthCount] = await Promise.all([
      prisma.participant.count(),
      prisma.participant.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.participant.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      prisma.participant.count({
        where: { createdAt: { gte: monthAgo } },
      }),
    ]);

    return res.json({
      total,
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
    });
  } catch (error: any) {
    console.error('Error fetching participant stats:', error);
    return res.status(500).json({ error: 'Error al obtener estadísticas de participantes' });
  }
});

// Ticket Stats
router.get('/tickets', verifyAdminAuth, async (_req: Request, res: Response) => {
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

// Recent Activity
router.get('/activity', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Obtener participantes recientes
    const recentParticipants = await prisma.participant.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        referenceId: true,
        createdAt: true,
      },
    });

    // Obtener referencias recientes usadas
    const recentReferences = await prisma.reference.findMany({
      where: { used: true },
      take: Math.floor(limit / 2),
      orderBy: { usedAt: 'desc' },
      select: {
        reference: true,
        usedAt: true,
      },
    });

    // Combinar y formatear actividades
    const activities = [
      ...recentParticipants.map((p) => ({
        id: `participant-${p.id}`,
        type: 'participant_registered' as const,
        description: `${p.name} se registró con referencia ${p.referenceId}`,
        timestamp: p.createdAt.toISOString(),
        metadata: { participantId: p.id, referenceId: p.referenceId },
      })),
      ...recentReferences.map((r) => ({
        id: `reference-${r.reference}`,
        type: 'reference_used' as const,
        description: `Referencia ${r.reference} fue utilizada`,
        timestamp: r.usedAt!.toISOString(),
        metadata: { reference: r.reference },
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return res.json(activities);
  } catch (error: any) {
    console.error('Error fetching recent activity:', error);
    return res.status(500).json({ error: 'Error al obtener actividad reciente' });
  }
});

export default router;


