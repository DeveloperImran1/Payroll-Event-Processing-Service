import prisma from '../../../shared/prisma';
import { eventQueue } from '../../jobs/eventQueue';

const createEventIntoDB = async (payload: any) => {
  const { employeeId, eventType, ...restPayload } = payload;
  
  // 1. Save event to PostgreSQL
  const result = await prisma.event.create({
    data: {
      employeeId,
      eventType,
      payload: restPayload,
    },
  });

  // 2. Push event ID to BullMQ for background processing
  await eventQueue.add(
    'process-payroll-event',
    {
      eventId: result.id,
    },
    {
      removeOnComplete: true, // Don't bloat Redis with completed jobs
      attempts: 3, // Retry 3 times if processing fails (Requirement 4 & 7)
      backoff: {
        type: 'exponential',
        delay: 5000, // 5s, 25s, 125s...
      },
    }
  );
  
  return result;
};

const getEventFromDB = async (id: string) => {
  const result = await prisma.event.findUnique({
    where: { id },
  });
  return result;
};

export const EventServices = {
  createEventIntoDB,
  getEventFromDB,
};
