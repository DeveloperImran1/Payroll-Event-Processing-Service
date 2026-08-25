import { processPayrollEvent } from '../eventProcessor';
import prisma from '../../../shared/prisma';
import { UnrecoverableError } from 'bullmq';

describe('Payroll Event Processor Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw UnrecoverableError if event is not found in database', async () => {
    jest.spyOn(prisma.event, 'findUnique').mockResolvedValueOnce(null);

    const mockJob = { data: { eventId: 'non-existent-id' } } as any;

    await expect(processPayrollEvent(mockJob)).rejects.toThrow(UnrecoverableError);
  });

  it('should skip processing if event is already SUCCESS (Idempotency Requirement 6 & 8)', async () => {
    const mockEvent = {
      id: 'event-1',
      employeeId: 'EMP-001',
      eventType: 'BANK_ACCOUNT_CHANGE',
      status: 'SUCCESS',
      payload: {},
      createdAt: new Date(),
    };

    jest.spyOn(prisma.event, 'findUnique').mockResolvedValueOnce(mockEvent as any);
    const updateSpy = jest.spyOn(prisma.event, 'update');

    const mockJob = { data: { eventId: 'event-1' } } as any;
    await processPayrollEvent(mockJob);

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('should skip processing if event is already FAILED (Idempotency)', async () => {
    const mockEvent = {
      id: 'event-2',
      employeeId: 'EMP-001',
      eventType: 'BANK_ACCOUNT_CHANGE',
      status: 'FAILED',
      payload: {},
      createdAt: new Date(),
    };

    jest.spyOn(prisma.event, 'findUnique').mockResolvedValueOnce(mockEvent as any);
    const updateSpy = jest.spyOn(prisma.event, 'update');

    const mockJob = { data: { eventId: 'event-2' } } as any;
    await processPayrollEvent(mockJob);

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('should enforce event ordering and throw transient error if an earlier event for the same employee is pending (Requirement 9)', async () => {
    const currentEvent = {
      id: 'event-2',
      employeeId: 'EMP-001',
      eventType: 'SALARY_CHANGE',
      status: 'PENDING',
      payload: { newSalary: 80000, currency: 'USD' },
      createdAt: new Date('2026-08-25T12:00:00Z'),
    };

    const earlierPendingEvent = {
      id: 'event-1',
      employeeId: 'EMP-001',
      eventType: 'BANK_ACCOUNT_CHANGE',
      status: 'PENDING',
      createdAt: new Date('2026-08-25T11:00:00Z'),
    };

    jest.spyOn(prisma.event, 'findUnique').mockResolvedValueOnce(currentEvent as any);
    jest.spyOn(prisma.event, 'findFirst').mockResolvedValueOnce(earlierPendingEvent as any);

    const mockJob = { data: { eventId: 'event-2' } } as any;

    await expect(processPayrollEvent(mockJob)).rejects.toThrow(/OrderDependency/);
  });

  it('should throw UnrecoverableError on permanent business rejection (Requirement 4)', async () => {
    const mockEvent = {
      id: 'event-invalid-iban',
      employeeId: 'EMP-005',
      eventType: 'BANK_ACCOUNT_CHANGE',
      status: 'PENDING',
      payload: { iban: 'INVALID_IBAN_999' },
      createdAt: new Date(),
    };

    jest.spyOn(prisma.event, 'findUnique').mockResolvedValueOnce(mockEvent as any);
    jest.spyOn(prisma.event, 'findFirst').mockResolvedValueOnce(null);
    jest.spyOn(prisma.event, 'update').mockResolvedValueOnce({} as any);

    const mockJob = { data: { eventId: 'event-invalid-iban' } } as any;

    await expect(processPayrollEvent(mockJob)).rejects.toThrow(UnrecoverableError);
  });
});
