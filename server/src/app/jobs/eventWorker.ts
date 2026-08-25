import { Worker, Job } from 'bullmq';
import redisConnection from '../../shared/redis';
import { EVENT_QUEUE_NAME } from './eventQueue';
import { processPayrollEvent } from './eventProcessor';
import prisma from '../../shared/prisma';
import logger from '../../shared/logger';

export const initWorker = () => {
  const worker = new Worker(
    EVENT_QUEUE_NAME,
    async (job: Job) => {
      if (job.name === 'process-payroll-event') {
        await processPayrollEvent(job);
      }
    },
    {
      connection: redisConnection,
      concurrency: 5, // Process up to 5 jobs concurrently across workers
    }
  );

  worker.on('completed', (job) => {
    logger.info(`✅ [Worker] Job ${job.id} for event ${job.data?.eventId} completed successfully.`);
  });

  // Listen for jobs that failed permanently (after all retries or unrecoverable error)
  worker.on('failed', async (job, err) => {
    logger.error(`❌ [Worker] Job ${job?.id} permanently failed: ${err.message}`);
    
    if (job && job.data && job.data.eventId) {
      try {
        await prisma.event.update({
          where: { id: job.data.eventId },
          data: {
            status: 'FAILED',
            failureReason: err.message,
          },
        });
        logger.info(`[Worker] Updated event ${job.data.eventId} status to FAILED in database.`);
      } catch (dbError) {
        logger.error('[Worker] Error updating database status on job failure', dbError);
      }
    }
  });

  // Listen for transient/retryable worker errors
  worker.on('error', (err) => {
    logger.warn(`⚠️ [Worker] Transient worker warning/error: ${err.message}`);
  });

  logger.info(`[Worker] Started listening on BullMQ queue: "${EVENT_QUEUE_NAME}" with concurrency: 5`);
  
  return worker;
};
