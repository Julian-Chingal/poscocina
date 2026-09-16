import { ZodType } from 'zod';
import { ValidationError } from '../errors/app-error.js';

export function validate<T>(schema: ZodType<T, any, any>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const formattedErrors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));
    throw new ValidationError('Los datos enviados no son válidos', formattedErrors);
  }
  return result.data;
}
