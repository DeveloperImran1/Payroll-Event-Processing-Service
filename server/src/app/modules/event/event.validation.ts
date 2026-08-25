import { z } from 'zod';

const BankAccountChangeSchema = z.object({
  eventType: z.literal('BANK_ACCOUNT_CHANGE'),
  employeeId: z.string({ message: 'employeeId is required' }),
  effectiveDate: z.string({ message: 'effectiveDate is required' }),
  iban: z.string({ message: 'iban is required' }),
});

const AddressChangeSchema = z.object({
  eventType: z.literal('ADDRESS_CHANGE'),
  employeeId: z.string({ message: 'employeeId is required' }),
  effectiveDate: z.string({ message: 'effectiveDate is required' }),
  street: z.string({ message: 'street is required' }),
  city: z.string({ message: 'city is required' }),
  postalCode: z.string({ message: 'postalCode is required' }),
  country: z.string({ message: 'country is required' }),
});

const SalaryChangeSchema = z.object({
  eventType: z.literal('SALARY_CHANGE'),
  employeeId: z.string({ message: 'employeeId is required' }),
  effectiveDate: z.string({ message: 'effectiveDate is required' }),
  newSalary: z.number({ message: 'newSalary is required' }),
  currency: z.string({ message: 'currency is required' }),
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
