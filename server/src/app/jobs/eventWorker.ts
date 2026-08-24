import { Worker, Job } from 'bullmq';
import redisConnection from '../../shared/redis';
import { EVENT_QUEUE_NAME } from './eventQueue';
import { processPayrollEvent } from './eventProcessor';
import prisma from '../../shared/prisma';

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
      concurrency: 5, // Process up to 5 jobs concurrently
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ [Worker] Job ${job.id} has completed!`);
  });

  // Listen for jobs that failed ALL attempts (Permanent Failure)
  worker.on('failed', async (job, err) => {
    console.error(`❌ [Worker] Job ${job?.id} has permanently failed. Reason: ${err.message}`);
    
    if (job && job.data && job.data.eventId) {
      try {
        await prisma.event.update({
          where: { id: job.data.eventId },
          data: {
            status: 'FAILED',
            failureReason: err.message,
          },
        });
        console.log(`[Worker] Updated DB status to FAILED for event ${job.data.eventId}`);
      } catch (dbError) {
        console.error('[Worker] Failed to update DB status on permanent failure', dbError);
      }
    }
  });

  // Listen for retryable errors (Temporary Failure)
  worker.on('error', (err) => {
    console.error(`⚠️ [Worker] Encountered a temporary error:`, err);
  });

  console.log(`[Worker] Started listening on queue: ${EVENT_QUEUE_NAME}`);
  
  return worker;
};
