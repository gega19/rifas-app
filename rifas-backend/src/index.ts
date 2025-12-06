import express from 'express';
import cors from 'cors';
import publicRoutes from './routes/public';
import adminAuthRoutes from './routes/admin/auth';
import adminAnalyticsRoutes from './routes/admin/analytics';
import adminReferencesRoutes from './routes/admin/references';
import adminParticipantsRoutes from './routes/admin/participants';
import adminTicketsRoutes from './routes/admin/tickets';
import adminResetRoutes from './routes/admin/reset';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Helper function to clean URLs (remove trailing slashes)
const cleanUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  return url.replace(/\/+$/, ''); // Remove trailing slashes
};

const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [cleanUrl(process.env.WEB_URL), cleanUrl(process.env.BACKOFFICE_URL)].filter((url): url is string => Boolean(url))
  : true; // Allow all origins in development

if (process.env.NODE_ENV === 'production') {
  console.log('[CORS] Allowed origins:', allowedOrigins);
  console.log('[CORS] WEB_URL:', process.env.WEB_URL, '-> cleaned:', cleanUrl(process.env.WEB_URL));
  console.log('[CORS] BACKOFFICE_URL:', process.env.BACKOFFICE_URL, '-> cleaned:', cleanUrl(process.env.BACKOFFICE_URL));
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Root endpoint
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Rifas API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      validateReference: '/validate-reference',
      generateTickets: '/generate-tickets',
      admin: '/admin'
    }
  });
});

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
app.use('/admin', adminResetRoutes);

// Export app for Vercel serverless
export default app;

// Start server only if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}


