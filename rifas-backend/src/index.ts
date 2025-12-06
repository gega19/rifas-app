import express from 'express';
import cors from 'cors';
import publicRoutes from './routes/public';
import adminAuthRoutes from './routes/admin/auth';
import adminAnalyticsRoutes from './routes/admin/analytics';
import adminReferencesRoutes from './routes/admin/references';
import adminParticipantsRoutes from './routes/admin/participants';
import adminTicketsRoutes from './routes/admin/tickets';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.WEB_URL, process.env.BACKOFFICE_URL].filter(Boolean)
    : true, // Allow all origins in development
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
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

// Export app for Vercel serverless
export default app;

// Start server only if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}


