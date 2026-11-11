import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import hackathonRoutes from './routes/hackathonRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { seedAdmin } from './utils/seedAdmin.js';
import { seedDefaultEventIfEmpty } from './controllers/eventController.js';

// Load environment variables
dotenv.config();

// Initialize MongoDB connection & ensure admin account and default hackathon event exist
connectDB().then(() => {
  seedAdmin();
  seedDefaultEventIfEmpty();
});

const app = express();

// Middlewares - Fully permissive CORS with credentials for production & preview domains
app.use(
  cors({
    origin: true, // Automatically reflects any calling origin (e.g. *.vercel.app, localhost)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Prints immediately in Render logs for every incoming request)
app.use((req, res, next) => {
  console.log(`[HTTP Request] ${req.method} ${req.originalUrl}`);
  next();
});

// Root Welcome / Health Probe Endpoint (Used by Render & Browsers)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    organization: 'MatruCare AI',
    service: 'Hackathon Registration Portal Backend API',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      user: '/api/user',
      hackathon: '/api/hackathon',
      contact: '/api/contact',
      events: '/api/events',
      auditLogs: '/api/audit-logs',
    },
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Health Check
app.get('/api/health', (req, res) => {
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').trim();

  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    organization: 'HackSphere',
    service: 'HackSphere National Hackathon Portal API',
    emailConfig: {
      hasUser: Boolean(emailUser),
      user: emailUser ? emailUser.replace(/(?<=.{3}).(?=.*@)/g, '*') : 'NOT_SET',
      hasPass: Boolean(emailPass && emailPass.length > 0),
      passLength: emailPass.length,
    },
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/hackathon', hackathonRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/audit-logs', auditRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[HackSphere Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[HackSphere Server] Health check available at: http://localhost:${PORT}/api/health`);
});

