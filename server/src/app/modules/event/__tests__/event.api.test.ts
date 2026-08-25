import request from 'supertest';
import app from '../../../../app';
import prisma from '../../../../shared/prisma';
import { eventQueue } from '../../../jobs/eventQueue';

describe('Event API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status payload', async () => {
      const res = await request(app).get('/health');
      expect([200, 503]).toContain(res.status);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('services');
    });
  });

  describe('POST /api/v1/events', () => {
    it('should accept valid BANK_ACCOUNT_CHANGE event and return 202', async () => {
      const mockEvent = {
        id: '11111111-2222-3333-4444-555555555555',
        employeeId: 'EMP-001',
        eventType: 'BANK_ACCOUNT_CHANGE',
        status: 'PENDING',
        payload: { iban: 'BD1234567890', effectiveDate: '2026-09-01' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.event, 'create').mockResolvedValueOnce(mockEvent as any);
      jest.spyOn(eventQueue, 'add').mockResolvedValueOnce({ id: 'job-1' } as any);

      const res = await request(app)
        .post('/api/v1/events')
        .send({
          eventType: 'BANK_ACCOUNT_CHANGE',
          employeeId: 'EMP-001',
          effectiveDate: '2026-09-01',
          iban: 'BD1234567890',
        });

      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Event accepted for processing');
      expect(res.body.data.id).toBe(mockEvent.id);
    });

    it('should accept valid ADDRESS_CHANGE event and return 202', async () => {
      const mockEvent = {
        id: '22222222-2222-3333-4444-555555555555',
        employeeId: 'EMP-002',
        eventType: 'ADDRESS_CHANGE',
        status: 'PENDING',
        payload: { street: '123 Main', city: 'Dhaka', postalCode: '1200', country: 'BD' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.event, 'create').mockResolvedValueOnce(mockEvent as any);
      jest.spyOn(eventQueue, 'add').mockResolvedValueOnce({ id: 'job-2' } as any);

      const res = await request(app)
        .post('/api/v1/events')
        .send({
          eventType: 'ADDRESS_CHANGE',
          employeeId: 'EMP-002',
          effectiveDate: '2026-09-01',
          street: '123 Main',
          city: 'Dhaka',
          postalCode: '1200',
          country: 'BD',
        });

      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
    });

    it('should accept valid SALARY_CHANGE event and return 202', async () => {
      const mockEvent = {
        id: '33333333-2222-3333-4444-555555555555',
        employeeId: 'EMP-003',
        eventType: 'SALARY_CHANGE',
        status: 'PENDING',
        payload: { newSalary: 75000, currency: 'USD' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.event, 'create').mockResolvedValueOnce(mockEvent as any);
      jest.spyOn(eventQueue, 'add').mockResolvedValueOnce({ id: 'job-3' } as any);

      const res = await request(app)
        .post('/api/v1/events')
        .send({
          eventType: 'SALARY_CHANGE',
          employeeId: 'EMP-003',
          effectiveDate: '2026-09-01',
          newSalary: 75000,
          currency: 'USD',
        });

      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
    });

    it('should reject invalid payload missing required fields with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/events')
        .send({
          eventType: 'BANK_ACCOUNT_CHANGE',
          // missing employeeId and iban
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Validation Error');
    });

    it('should reject unknown eventType with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/events')
        .send({
          eventType: 'UNKNOWN_EVENT_TYPE',
          employeeId: 'EMP-999',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/events/:id', () => {
    it('should return event details when event exists', async () => {
      const mockEvent = {
        id: 'test-event-id-123',
        employeeId: 'EMP-001',
        eventType: 'BANK_ACCOUNT_CHANGE',
        status: 'SUCCESS',
        payload: { iban: 'BD123' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.event, 'findUnique').mockResolvedValueOnce(mockEvent as any);

      const res = await request(app).get('/api/v1/events/test-event-id-123');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('test-event-id-123');
      expect(res.body.data.status).toBe('SUCCESS');
    });
  });

  describe('GET /api/v1/events', () => {
    it('should return list of all events', async () => {
      const mockEvents = [
        { id: '1', employeeId: 'EMP-001', eventType: 'BANK_ACCOUNT_CHANGE', status: 'SUCCESS' },
        { id: '2', employeeId: 'EMP-002', eventType: 'SALARY_CHANGE', status: 'PENDING' },
      ];

      jest.spyOn(prisma.event, 'findMany').mockResolvedValueOnce(mockEvents as any);

      const res = await request(app).get('/api/v1/events');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });
  });
});
