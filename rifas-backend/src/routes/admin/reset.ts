import { Router } from 'express';
import type { Request, Response } from 'express';
import { verifyAdminAuth } from '../../middleware/auth';
import { prisma } from '../../config/database';

const router = Router();

// Reset raffle - Delete all participants, tickets, and reset references
router.post('/reset', verifyAdminAuth, async (_req: Request, res: Response) => {
  try {
    // Use transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Delete all participants (this will cascade delete tickets due to foreign key)
      await tx.participant.deleteMany();
      
      // Delete all tickets (in case there are orphaned tickets)
      await tx.ticket.deleteMany();
      
      // Reset all references (mark as unused)
      await tx.reference.updateMany({
        data: {
          used: false,
          usedAt: null,
        },
      });
    });

    return res.json({
      success: true,
      message: 'Rifa reiniciada exitosamente. Todos los datos han sido eliminados y las referencias han sido reseteadas.',
    });
  } catch (error: any) {
    console.error('Error resetting raffle:', error);
    return res.status(500).json({
      success: false,
      error: `Error al reiniciar la rifa: ${error.message}`,
    });
  }
});

export default router;

