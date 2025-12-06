import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '../../middleware/rateLimit';
import { prisma } from '../../config/database';

const router = Router();

// Admin Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ success: false, error: 'Demasiadas solicitudes. Por favor intenta más tarde.' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Usuario y contraseña son requeridos' });
    }

    // Buscar usuario admin en la base de datos usando Prisma
    const adminUser = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (!adminUser) {
      return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
    }

    // Verificar contraseña usando bcrypt
    const isValidPassword = bcrypt.compareSync(password, adminUser.password);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
    }

    // Generar token simple (en producción usar JWT)
    const token = Buffer.from(`${adminUser.id}:${Date.now()}`).toString('base64');

    // Retornar usuario sin contraseña
    const { password: _, ...userWithoutPassword } = adminUser;

    return res.json({
      success: true,
      token,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    return res.status(500).json({ success: false, error: `Error al iniciar sesión: ${error.message}` });
  }
});

// Admin Me - Verificar token y obtener usuario actual
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Decodificar token simple
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      
      // Buscar usuario en la base de datos usando Prisma
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!adminUser) {
        return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
      }

      return res.json({
        success: true,
        user: adminUser,
      });
    } catch (decodeError) {
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }
  } catch (error: any) {
    console.error('Error verifying token:', error);
    return res.status(500).json({ success: false, error: 'Error al verificar token' });
  }
});

export default router;


