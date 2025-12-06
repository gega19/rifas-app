import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
  adminUser?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export const verifyAdminAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[Auth] Missing or invalid Authorization header');
      res.status(401).json({ success: false, error: 'No autorizado' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token === 'null' || token === 'undefined') {
      console.error('[Auth] Token is null or undefined');
      res.status(401).json({ success: false, error: 'Token inválido' });
      return;
    }
    
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      
      if (!userId) {
        console.error('[Auth] No userId found in token');
        res.status(401).json({ success: false, error: 'Token inválido' });
        return;
      }
      
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: userId },
      });

      if (!adminUser) {
        console.error(`[Auth] Admin user not found for id: ${userId}`);
        res.status(401).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

      // Agregar usuario al request para uso posterior
      (req as AuthRequest).adminUser = {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
      };
      next();
    } catch (decodeError: any) {
      console.error('[Auth] Error decoding token:', decodeError.message);
      res.status(401).json({ success: false, error: 'Token inválido' });
      return;
    }
  } catch (error: any) {
    console.error('[Auth] Error in verifyAdminAuth:', error);
    res.status(500).json({ success: false, error: 'Error al verificar token' });
    return;
  }
};


