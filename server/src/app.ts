import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import prisma from './shared/prisma';
import redisConnection from './shared/redis';

const app: Application = express();

// parsers
app.use(express.json());
app.use(cors());

// application routes
app.use('/api/v1', router);

// Enhanced Health Check Endpoint (Requirement: Health Check)
app.get('/health', async (req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';

  try {
    // Ping DB
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'error';
  }

  try {
    // Ping Redis
    const pong = await redisConnection.ping();
    if (pong === 'PONG') {
      redisStatus = 'connected';
    }
  } catch (error) {
    redisStatus = 'error';
  }

  const isHealthy = dbStatus === 'connected' && redisStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString(),
    services: {
      server: 'UP',
      database: dbStatus,
      redis: redisStatus,
    },
  });
});

// global error handler
app.use(globalErrorHandler);

// not found
app.use(notFound);

export default app;
