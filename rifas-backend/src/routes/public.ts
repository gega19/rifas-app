import { Router } from 'express';
import type { Request, Response } from 'express';
import { checkRateLimit } from '../middleware/rateLimit';
import { prisma } from '../config/database';
import { validateEmail, validatePhone, validateCedula } from '../utils/validators';

const router = Router();

// Validar número de referencia
router.post('/validate-reference', async (req: Request, res: Response) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ valid: false, message: 'Demasiadas solicitudes. Por favor intenta más tarde.' });
    }

    const { reference } = req.body;

    if (!reference || typeof reference !== 'string') {
      return res.status(400).json({ valid: false, message: 'El número de referencia es requerido' });
    }

    // Limpiar la referencia: eliminar espacios y convertir a string
    const cleanReference = reference.trim();

    if (cleanReference.length !== 6 || !/^\d{6}$/.test(cleanReference)) {
      return res.status(400).json({ valid: false, message: 'El número de referencia debe tener 6 dígitos' });
    }

    // Verificar si la referencia existe y no ha sido usada usando Prisma
    const refData = await prisma.reference.findUnique({
      where: { reference: cleanReference },
    });
    
    if (!refData) {
      return res.status(404).json({ valid: false, message: 'Número de referencia no válido' });
    }

    if (refData.used) {
      return res.status(400).json({ valid: false, message: 'Este número de referencia ya ha sido utilizado' });
    }

    return res.json({ 
      valid: true, 
      reference: refData.reference,
      ticketCount: refData.ticketCount || 5,
      ticketValue: refData.ticketValue || 0,
    });
  } catch (error: any) {
    console.error('Error validating reference:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ valid: false, error: `Error al validar referencia: ${error.message}` });
  }
});

// Generar números de rifa
router.post('/generate-tickets', async (req: Request, res: Response) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ success: false, error: 'Demasiadas solicitudes. Por favor intenta más tarde.' });
    }

    const { reference, userData, ticketCount } = req.body;

    // Validate input
    if (!reference || typeof reference !== 'string' || reference.length !== 6 || !/^\d{6}$/.test(reference)) {
      return res.status(400).json({ success: false, error: 'Referencia inválida' });
    }

    if (!userData || typeof userData !== 'object') {
      return res.status(400).json({ success: false, error: 'Datos de usuario requeridos' });
    }

    // Validate user data
    if (!userData.name || typeof userData.name !== 'string' || userData.name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Nombre inválido' });
    }

    if (!userData.email || !validateEmail(userData.email)) {
      return res.status(400).json({ success: false, error: 'Email inválido' });
    }

    if (!userData.phone || !validatePhone(userData.phone)) {
      return res.status(400).json({ success: false, error: 'Teléfono inválido' });
    }

    if (!userData.cedula || !validateCedula(userData.cedula)) {
      return res.status(400).json({ success: false, error: 'Cédula inválida' });
    }

    if (!ticketCount || typeof ticketCount !== 'number' || ticketCount < 1) {
      return res.status(400).json({ success: false, error: 'Número de tickets inválido (debe ser mayor a 0)' });
    }

    // Verificar que la referencia no haya sido usada usando Prisma
    const refData = await prisma.reference.findUnique({
      where: { reference },
    });
    
    if (!refData || refData.used) {
      return res.status(400).json({ success: false, error: 'Referencia no válida o ya utilizada' });
    }

    // Obtener números ya asignados usando Prisma
    const usedTickets = await prisma.ticket.findMany({
      where: { used: true },
      select: { number: true },
    });
    const usedTicketNumbers = new Set(usedTickets.map(t => t.number));

    // Generar números únicos no usados
    const generatedTickets: string[] = [];
    const maxAttempts = 10000;
    let attempts = 0;

    while (generatedTickets.length < ticketCount && attempts < maxAttempts) {
      const randomNumber = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      
      if (!usedTicketNumbers.has(randomNumber) && !generatedTickets.includes(randomNumber)) {
        generatedTickets.push(randomNumber);
        usedTicketNumbers.add(randomNumber);
      }
      attempts++;
    }

    if (generatedTickets.length < ticketCount) {
      return res.status(400).json({ success: false, error: 'No hay suficientes números disponibles' });
    }

    // Guardar usando Prisma en una transacción
    await prisma.$transaction(async (tx) => {
      // Crear participante
      await tx.participant.create({
        data: {
          referenceId: reference,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          cedula: userData.cedula,
          tickets: generatedTickets,
        },
      });

      // Crear tickets individuales
      await tx.ticket.createMany({
        data: generatedTickets.map(num => ({ number: num, used: true })),
        skipDuplicates: true,
      });

      // Marcar referencia como usada
      await tx.reference.update({
        where: { reference },
        data: { used: true, usedAt: new Date() },
      });
    });

    return res.json({ 
      success: true, 
      tickets: generatedTickets,
      message: 'Números generados exitosamente'
    });
  } catch (error: any) {
    console.error('Error generating tickets:', error);
    return res.status(500).json({ error: 'Error al generar números' });
  }
});

// Obtener estadísticas
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const totalUsed = await prisma.ticket.count({
      where: { used: true },
    });
    const totalAvailable = 10000 - totalUsed;

    return res.json({
      totalTickets: 10000,
      used: totalUsed,
      available: totalAvailable,
      percentageUsed: ((totalUsed / 10000) * 100).toFixed(2)
    });
  } catch (error: any) {
    console.error('Error getting stats:', error);
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

export default router;


