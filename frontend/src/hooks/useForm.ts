import { useState, useCallback } from 'react';
import type { FormState } from '../types';

type ValidationRule<T> = {
  [K in keyof T]?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: T[K]) => string | undefined;
  };
};

export function useForm<T extends Record<string, unknown>>(
  initialData: T,
  validationRules?: ValidationRule<T>
) {
  const [formState, setFormState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isSubmitting: false,
    isDirty: false,
  });

  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]): string | undefined => {
      const rules = validationRules?.[name];
      if (!rules) return undefined;

      if (rules.required && (!value || value === '')) {
        return `${String(name)} is required`;
      }

      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        return `${String(name)} must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        return `${String(name)} must be no more than ${rules.maxLength} characters`;
      }

      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        return `${String(name)} format is invalid`;
      }

      if (rules.custom) {
        return rules.custom(value);
      }

      return undefined;
    },
    [validationRules]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(formState.data).forEach((key) => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, formState.data[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setFormState(prev => ({ ...prev, errors: newErrors }));
    return isValid;
  }, [formState.data, validateField]);

  const setFieldValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setFormState(prev => {
      const newData = { ...prev.data, [name]: value };
      const fieldError = validateField(name, value);
      const newErrors = { ...prev.errors };
      
      if (fieldError) {
        newErrors[name] = fieldError;
      } else {
        delete newErrors[name];
      }

      return {
        ...prev,
        data: newData,
        errors: newErrors,
        isDirty: true,
      };
    });
  }, [validateField]);

  const setIsSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState(prev => ({ ...prev, isSubmitting }));
  }, []);

  const reset = useCallback(() => {
    setFormState({
      data: initialData,
      errors: {},
      isSubmitting: false,
      isDirty: false,
    });
  }, [initialData]);

  const setErrors = useCallback((errors: Partial<Record<keyof T, string>>) => {
    setFormState(prev => ({ ...prev, errors }));
  }, []);

  return {
    ...formState,
    setFieldValue,
    setIsSubmitting,
    validateForm,
    reset,
    setErrors,
  };
}