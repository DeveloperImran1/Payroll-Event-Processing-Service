import { z } from 'zod';

const BankAccountChangeSchema = z.object({
  eventType: z.literal('BANK_ACCOUNT_CHANGE'),
  employeeId: z.string({ required_error: 'employeeId is required' }),
  effectiveDate: z.string({ required_error: 'effectiveDate is required' }),
  iban: z.string({ required_error: 'iban is required' }),
});

const AddressChangeSchema = z.object({
  eventType: z.literal('ADDRESS_CHANGE'),
  employeeId: z.string({ required_error: 'employeeId is required' }),
  effectiveDate: z.string({ required_error: 'effectiveDate is required' }),
  street: z.string({ required_error: 'street is required' }),
  city: z.string({ required_error: 'city is required' }),
  postalCode: z.string({ required_error: 'postalCode is required' }),
  country: z.string({ required_error: 'country is required' }),
});

const SalaryChangeSchema = z.object({
  eventType: z.literal('SALARY_CHANGE'),
  employeeId: z.string({ required_error: 'employeeId is required' }),
  effectiveDate: z.string({ required_error: 'effectiveDate is required' }),
  newSalary: z.number({ required_error: 'newSalary is required' }),
  currency: z.string({ required_error: 'currency is required' }),
});

const createEventValidation = z.object({
  body: z.discriminatedUnion('eventType', [
    BankAccountChangeSchema,
    AddressChangeSchema,
    SalaryChangeSchema,
  ]),
});

export const EventValidations = {
  createEventValidation,
};
