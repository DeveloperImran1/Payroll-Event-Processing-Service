import { Queue } from 'bullmq';
import redisConnection from '../../shared/redis';

export const EVENT_QUEUE_NAME = 'payroll-events-queue';

export const eventQueue = new Queue(EVENT_QUEUE_NAME, {
  connection: redisConnection,
});
