import { Job, UnrecoverableError } from 'bullmq';
import prisma from '../../shared/prisma';
import logger from '../../shared/logger';

export const processPayrollEvent = async (job: Job) => {
  const { eventId } = job.data;

  // 1. Fetch event from DB
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new UnrecoverableError(`Event with ID ${eventId} not found in database.`);
  }

  // 2. Idempotency Check (Requirements 6 & 8)
  // If already processed by another worker or in a previous run, skip gracefully
  if (event.status === 'SUCCESS' || event.status === 'FAILED') {
    logger.info(`[Processor] Event ${eventId} is already in '${event.status}' state. Skipping redundant execution.`);
    return;
  }

  // 3. Event Ordering Guarantee per Employee (Requirement 9)
  // Check if an earlier event for the same employee is still PENDING or PROCESSING
  const pendingPredecessor = await prisma.event.findFirst({
    where: {
      employeeId: event.employeeId,
      createdAt: { lt: event.createdAt },
      status: { in: ['PENDING', 'PROCESSING'] },
      id: { not: eventId },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (pendingPredecessor) {
    logger.warn(
      `[Processor] Event ${eventId} (Employee: ${event.employeeId}) is waiting for earlier event ${pendingPredecessor.id} (${pendingPredecessor.status}) to complete.`
    );
    // Throw a transient error so BullMQ retries after backoff
    throw new Error(
      `OrderDependency: Waiting for predecessor event ${pendingPredecessor.id} of employee ${event.employeeId} to finish.`
    );
  }

  // 4. Mark as PROCESSING
  await prisma.event.update({
    where: { id: eventId },
    data: { status: 'PROCESSING' },
  });
  logger.info(`[Processor] Event ${eventId} (${event.eventType}) marked as PROCESSING.`);

  // 5. Business Validation & Simulation of External Payroll Provider (Requirements 3, 4 & 10)
  const payload = event.payload as any;

  // Permanent failure check example: check for invalid IBAN pattern or negative salary
  if (event.eventType === 'BANK_ACCOUNT_CHANGE' && payload?.iban && payload.iban.startsWith('INVALID')) {
    throw new UnrecoverableError(`Permanent Failure: IBAN "${payload.iban}" rejected by central banking clearing system.`);
  }

  if (event.eventType === 'SALARY_CHANGE' && payload?.newSalary && payload.newSalary < 0) {
    throw new UnrecoverableError(`Permanent Failure: Salary amount cannot be negative (${payload.newSalary}).`);
  }

  // Simulate external asynchronous communication delay
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      // 15% chance of simulated transient network failure
      const isTransientFailure = Math.random() < 0.15;
      
      if (isTransientFailure) {
        return reject(new Error('Transient Error: External payroll provider gateway timeout (504). Retrying...'));
      }
      resolve(true);
    }, 1500); // 1.5 seconds simulation
  });

  // 6. On Successful execution, mark as SUCCESS
  await prisma.event.update({
    where: { id: eventId },
    data: {
      status: 'SUCCESS',
      failureReason: null,
    },
  });

  logger.info(`[Processor] Event ${eventId} processing SUCCESSFUL.`);
};
