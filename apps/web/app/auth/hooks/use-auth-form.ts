import { useState, useCallback } from "react";
import { ZodSchema, ZodError } from "zod";

/**
 * Generic form state management hook for auth forms
 */
export function useAuthForm<T extends Record<string, any>>(
  initialData: T,
  schema: ZodSchema<T>,
) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<T>>({});

  const updateField = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors],
  );

  const updateMultipleFields = useCallback((updates: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const validate = useCallback((): { valid: boolean; errors: Partial<T> } => {
    try {
      schema.parse(formData);
      setErrors({});
      return { valid: true, errors: {} };
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Partial<T> = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof T;
          if (field) {
            fieldErrors[field] = issue.message as T[keyof T];
          }
        });
        setErrors(fieldErrors);
        return { valid: false, errors: fieldErrors };
      }
      return { valid: false, errors: {} };
    }
  }, [formData, schema]);

  const reset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  const setFieldError = useCallback((field: keyof T, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message as T[keyof T] }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    updateField,
    updateMultipleFields,
    validate,
    reset,
    setFieldError,
    clearErrors,
    setFormData,
    setErrors,
  };
}

