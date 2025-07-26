import { z } from 'zod';
import type { AxiosResponse } from 'axios';

export class ValidationError extends Error {
  public readonly details?: z.ZodError;
  
  constructor(message: string, details?: z.ZodError) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * Validates data against a Zod schema and throws a ValidationError if invalid
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown, context = 'data'): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = `Invalid ${context}: ${error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
      throw new ValidationError(errorMessage, error);
    }
    throw error;
  }
}

/**
 * Validates an API response data field against a schema
 */
export function validateResponse<T>(
  schema: z.ZodSchema<T>, 
  response: AxiosResponse
): T {
  if (!response.data) {
    throw new ValidationError('API response has no data field');
  }
  
  return validateData(schema, response.data, 'API response');
}

/**
 * Creates a validated API function wrapper
 * This wrapper automatically validates the response data against the provided schema
 */
export function createValidatedAPIFunction<TParams extends any[], TResponse>(
  apiFunction: (...args: TParams) => Promise<AxiosResponse>,
  responseSchema: z.ZodSchema<TResponse>
) {
  return async (...args: TParams): Promise<TResponse> => {
    try {
      const response = await apiFunction(...args);
      return validateResponse(responseSchema, response);
    } catch (error) {
      // If it's already a ValidationError, re-throw as is
      if (error instanceof ValidationError) {
        throw error;
      }
      
      // For other errors (network, auth, etc.), pass them through
      throw error;
    }
  };
}

/**
 * Validates response data in development mode only
 * In production, returns the data as-is for performance
 */
export function validateInDev<T>(schema: z.ZodSchema<T>, data: unknown, context = 'data'): T {
  if (import.meta.env.DEV) {
    return validateData(schema, data, context);
  }
  return data as T;
}