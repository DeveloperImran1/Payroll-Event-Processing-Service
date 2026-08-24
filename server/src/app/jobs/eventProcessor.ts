import { Job } from 'bullmq';
import prisma from '../../../shared/prisma';

export const processPayrollEvent = async (job: Job) => {
  const { eventId } = job.data;

  // 1. Fetch event from DB
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error(`Event with ID ${eventId} not found in database.`);
  }

  // 2. Idempotency Check (Requirement 6 & 8)
  // If multiple workers accidentally pick it up, or if it crashed AFTER writing SUCCESS
  if (event.status === 'SUCCESS' || event.status === 'FAILED') {
    console.log(`[Processor] Event ${eventId} is already processed. Skipping.`);
    return;
  }

  // 3. Mark as PROCESSING
  await prisma.event.update({
    where: { id: eventId },
    data: { status: 'PROCESSING' },
  });
  console.log(`[Processor] Event ${eventId} marked as PROCESSING.`);

  // 4. Simulate actual external payroll processing (Requirement 3 & 4)
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      // 20% chance to simulate a temporary external API failure
      const isTemporaryFailure = Math.random() < 0.2;
      
      if (isTemporaryFailure) {
        return reject(new Error('Simulated Temporary Network Failure from Payroll Provider'));
      }
      resolve(true);
    }, 2000); // 2 seconds processing time
  });

  // 5. If successful, mark as SUCCESS
  await prisma.event.update({
    where: { id: eventId },
    data: { status: 'SUCCESS' },
  });
  
  console.log(`[Processor] Event ${eventId} processing SUCCESSFUL.`);
};
