import { Router } from 'express';
import type { Request, Response } from 'express';
import { verifyAdminAuth } from '../../middleware/auth';
import { prisma } from '../../config/database';

const router = Router();

// Get references with pagination and filters
router.get('/', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const used = req.query.used === 'true' ? true : req.query.used === 'false' ? false : undefined;
    const search = req.query.search as string;

    const where: any = {};
    if (used !== undefined) {
      where.used = used;
    }
    if (search) {
      where.reference = { contains: search };
    }

    const [references, total] = await Promise.all([
      prisma.reference.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.reference.count({ where }),
    ]);

    return res.json({
      references,
      total,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('Error fetching references:', error);
    return res.status(500).json({ error: 'Error al obtener referencias' });
  }
});

// Create reference
router.post('/', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { reference, ticketCount, ticketValue } = req.body;

    if (!reference || typeof reference !== 'string' || reference.length !== 6 || !/^\d{6}$/.test(reference)) {
      return res.status(400).json({ error: 'Referencia inválida' });
    }

    if (!ticketCount || typeof ticketCount !== 'number' || ticketCount < 1) {
      return res.status(400).json({ error: 'Cantidad de tickets inválida (debe ser mayor a 0)' });
    }

    if (ticketValue !== undefined && ticketValue !== null && (typeof ticketValue !== 'number' || ticketValue < 0)) {
      return res.status(400).json({ error: 'Valor del ticket inválido (debe ser mayor o igual a 0)' });
    }

    const newReference = await prisma.reference.create({
      data: {
        reference,
        ticketCount,
        ticketValue: ticketValue !== undefined && ticketValue !== null ? ticketValue : 0,
        used: false,
      },
    });

    return res.json(newReference);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Esta referencia ya existe' });
    }
    console.error('Error creating reference:', error);
    return res.status(500).json({ error: 'Error al crear referencia' });
  }
});

// Update reference
router.put('/:id', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ticketCount, ticketValue, used } = req.body;

    const updateData: any = {};
    if (ticketCount !== undefined) {
      if (typeof ticketCount !== 'number' || ticketCount < 1) {
        return res.status(400).json({ error: 'Cantidad de tickets inválida (debe ser mayor a 0)' });
      }
      updateData.ticketCount = ticketCount;
    }
    if (ticketValue !== undefined && ticketValue !== null) {
      if (typeof ticketValue !== 'number' || ticketValue < 0) {
        return res.status(400).json({ error: 'Valor del ticket inválido (debe ser mayor o igual a 0)' });
      }
      updateData.ticketValue = ticketValue;
    }
    if (used !== undefined) {
      updateData.used = used;
      if (used) {
        updateData.usedAt = new Date();
      } else {
        updateData.usedAt = null;
      }
    }

    const updated = await prisma.reference.update({
      where: { id },
      data: updateData,
    });

    return res.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Referencia no encontrada' });
    }
    console.error('Error updating reference:', error);
    return res.status(500).json({ error: 'Error al actualizar referencia' });
  }
});

// Delete reference
router.delete('/:id', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.reference.delete({
      where: { id },
    });

    return res.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Referencia no encontrada' });
    }
    console.error('Error deleting reference:', error);
    return res.status(500).json({ error: 'Error al eliminar referencia' });
  }
});

// Bulk create references
router.post('/bulk', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { references } = req.body;

    if (!Array.isArray(references) || references.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de referencias' });
    }

    const errors: string[] = [];
    let created = 0;

    for (const ref of references) {
      try {
        if (!ref.reference || ref.reference.length !== 6 || !/^\d{6}$/.test(ref.reference)) {
          errors.push(`Referencia ${ref.reference || 'vacía'} inválida`);
          continue;
        }

        if (!ref.ticketCount || ref.ticketCount < 1) {
          errors.push(`Referencia ${ref.reference}: cantidad de tickets inválida (debe ser mayor a 0)`);
          continue;
        }

        if (ref.ticketValue !== undefined && ref.ticketValue !== null && (typeof ref.ticketValue !== 'number' || ref.ticketValue < 0)) {
          errors.push(`Referencia ${ref.reference}: valor del ticket inválido`);
          continue;
        }

        await prisma.reference.create({
          data: {
            reference: ref.reference,
            ticketCount: ref.ticketCount,
            ticketValue: ref.ticketValue !== undefined && ref.ticketValue !== null ? ref.ticketValue : 0,
            used: false,
          },
        });
        created++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          errors.push(`Referencia ${ref.reference} ya existe`);
        } else {
          errors.push(`Error al crear ${ref.reference}: ${error.message}`);
        }
      }
    }

    return res.json({ created, errors });
  } catch (error: any) {
    console.error('Error bulk creating references:', error);
    return res.status(500).json({ error: 'Error al crear referencias' });
  }
});

// Export references to CSV
router.get('/export', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const used = req.query.used === 'true' ? true : req.query.used === 'false' ? false : undefined;

    const where: any = {};
    if (used !== undefined) {
      where.used = used;
    }

    const references = await prisma.reference.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const headers = ['Referencia', 'Tickets', 'Valor/Ticket', 'Valor Total', 'Usada', 'Fecha Uso', 'Creada'];
    const rows = references.map((ref) => [
      ref.reference,
      ref.ticketCount.toString(),
      ref.ticketValue ? Number(ref.ticketValue).toFixed(2) : '0.00',
      ref.ticketValue ? (Number(ref.ticketValue) * ref.ticketCount).toFixed(2) : '0.00',
      ref.used ? 'Sí' : 'No',
      ref.usedAt ? new Date(ref.usedAt).toLocaleDateString('es-VE') : '',
      new Date(ref.createdAt).toLocaleDateString('es-VE'),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=referencias-${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);
  } catch (error: any) {
    console.error('Error exporting references:', error);
    return res.status(500).json({ error: 'Error al exportar referencias' });
  }
});

export default router;


