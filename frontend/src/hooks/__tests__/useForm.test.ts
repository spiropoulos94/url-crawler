import { renderHook, act } from '@testing-library/react';
import { useForm } from '../useForm';

describe('useForm', () => {
  const initialData = { name: '', email: '' };
  const validationRules = {
    name: { required: true, minLength: 2 },
    email: { required: true, pattern: /\S+@\S+\.\S+/ },
  };

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useForm(initialData));
    
    expect(result.current.data).toEqual(initialData);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  it('updates field value and marks form as dirty', () => {
    const { result } = renderHook(() => useForm(initialData));
    
    act(() => {
      result.current.setFieldValue('name', 'John');
    });
    
    expect(result.current.data.name).toBe('John');
    expect(result.current.isDirty).toBe(true);
  });

  it('validates required fields', () => {
    const { result } = renderHook(() => useForm(initialData, validationRules));
    
    act(() => {
      result.current.validateForm();
    });
    
    expect(result.current.errors.name).toBe('name is required');
    expect(result.current.errors.email).toBe('email is required');
  });

  it('validates field on value change', () => {
    const { result } = renderHook(() => useForm(initialData, validationRules));
    
    act(() => {
      result.current.setFieldValue('name', 'J');
    });
    
    expect(result.current.errors.name).toBe('name must be at least 2 characters');
  });

  it('clears error when field becomes valid', () => {
    const { result } = renderHook(() => useForm(initialData, validationRules));
    
    act(() => {
      result.current.setFieldValue('name', 'J');
    });
    expect(result.current.errors.name).toBeDefined();
    
    act(() => {
      result.current.setFieldValue('name', 'John');
    });
    expect(result.current.errors.name).toBeUndefined();
  });

  it('resets form to initial state', () => {
    const { result } = renderHook(() => useForm(initialData));
    
    act(() => {
      result.current.setFieldValue('name', 'John');
      result.current.setIsSubmitting(true);
    });
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.data).toEqual(initialData);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });
});