import { ZodError } from "zod";

/**
 * Parse Zod validation errors into a field error object
 */
export function parseZodErrors<T extends Record<string, any>>(
  error: unknown,
): Partial<T> {
  if (error instanceof ZodError) {
    const fieldErrors: Partial<T> = {};
    error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof T;
      if (field) {
        fieldErrors[field] = issue.message as T[keyof T];
      }
    });
    return fieldErrors;
  }
  return {};
}

/**
 * Check if an error is a Zod validation error
 */
export function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError || 
    (error instanceof Error && 'issues' in error);
}

