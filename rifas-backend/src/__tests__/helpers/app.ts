import express from 'express';
import cors from 'cors';
import publicRoutes from '../../routes/public';
import adminAuthRoutes from '../../routes/admin/auth';
import adminAnalyticsRoutes from '../../routes/admin/analytics';
import adminReferencesRoutes from '../../routes/admin/references';
import adminParticipantsRoutes from '../../routes/admin/participants';
import adminTicketsRoutes from '../../routes/admin/tickets';

/**
 * Create Express app for testing (without starting server)
 */
export function createTestApp() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(express.json());

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Public routes
  app.use('/', publicRoutes);

  // Admin routes
  app.use('/admin', adminAuthRoutes);
  app.use('/admin/analytics', adminAnalyticsRoutes);
  app.use('/admin/references', adminReferencesRoutes);
  app.use('/admin/participants', adminParticipantsRoutes);
  app.use('/admin/tickets', adminTicketsRoutes);

  return app;
}

