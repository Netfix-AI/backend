import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment configuration
dotenv.config();

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import rbacRoutes from './routes/rbacRoutes.js';
import entityRoutes from './routes/entityRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import ocrRoutes from './routes/ocrRoutes.js';
import advocateRoutes from './routes/advocateRoutes.js';
import clientPortalRoutes from './routes/clientPortalRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import domainIntelligenceRoutes from './routes/domainIntelligenceRoutes.js';
import advancedAnalysisRoutes from './routes/advancedAnalysisRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import auditorRoutes from './routes/auditorRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Policy Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('CORS policy error: Origin not permitted.'));
      }
    },
    credentials: true,
  })
);

// Public Health Check Endpoint
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'Netfix AI — MARG GROUP Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Phase 1 Foundation Layer API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/rbac', rbacRoutes);
app.use('/api/v1/entities', entityRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/cases', caseRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/internal', ocrRoutes);
app.use('/api/v1/advocate', advocateRoutes);
app.use('/api/v1/client', clientPortalRoutes);
app.use('/api/v1/auditor', auditorRoutes);
app.use('/api/v1/query', queryRoutes);

// AI Agent Layer API Routes
app.use('/api/agent', agentRoutes);
app.use('/api/v1/agent', agentRoutes);

// Phase 2 Domain Intelligence Layer API Routes (Modules 10-19)
app.use('/api/v1', domainIntelligenceRoutes);

// Phase 3 Advanced Analysis & Oversight Layer API Routes (Modules 20-28)
app.use('/api/v1', advancedAnalysisRoutes);


// 404 Route Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested API endpoint does not exist.',
    },
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[GlobalErrorHandler]', err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : err.message,
    },
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`============================================================`);
  console.log(`🚀 NETFIX AI Backend API running on port ${PORT}`);
  console.log(`🌐 Frontend Origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🛡️ Admin Origin:    ${process.env.ADMIN_URL || 'http://localhost:3001'}`);
  console.log(`============================================================`);
});
