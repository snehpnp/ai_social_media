import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { CONFIG } from './config';

import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import adminRoutes from './routes/adminRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import aiProviderRoutes from './routes/aiProviderRoutes';
import socialRoutes from './routes/socialRoutes';
import { loadScheduledPosts } from './services/queueService';

dotenv.config();

const app = express();
const port = CONFIG.PORT;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai-providers', aiProviderRoutes);
app.use('/api/social', socialRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('AI Social Media Automation API is running...');
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// Start Server
app.listen(port, async () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${CONFIG.PORT}`);
  
  // Load scheduled posts on startup
  await loadScheduledPosts();
});

export { prisma };
