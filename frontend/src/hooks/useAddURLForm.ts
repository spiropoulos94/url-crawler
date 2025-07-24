import { useState } from 'react';
import { useAddURL } from './useURLs';
import type { AxiosError } from 'axios';

interface FormData {
  url: string;
}

interface FormErrors {
  url?: string;
}

export const useAddURLForm = () => {
  const [formData, setFormData] = useState<FormData>({ url: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addUrlMutation = useAddURL();

  const validateURL = (url: string): string | undefined => {
    if (!url.trim()) {
      return "URL is required";
    }

    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return undefined;
    } catch {
      return "Please enter a valid URL";
    }
  };

  const setFieldValue = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const urlError = validateURL(formData.url);
    const newErrors: FormErrors = {};
    
    if (urlError) {
      newErrors.url = urlError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);

    try {
      await addUrlMutation.mutateAsync({
        url: formData.url.trim(),
      });

      // Success! Reset form
      setFormData({ url: '' });
      setErrors({});
      
      // Show success state briefly
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);

      return true;
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      let errorMessage = "Failed to add URL";
      
      if (axiosError.response?.data?.error) {
        const backendError = axiosError.response.data.error;
        if (backendError.includes("Duplicate entry") || backendError.includes("already exists")) {
          errorMessage = "This URL already exists in the system. If you recently deleted it, please wait a moment and try again, or check if it's still in your URL list below.";
        } else {
          errorMessage = backendError;
        }
      }
      
      setErrors({ url: errorMessage });
      setIsSubmitting(false);
      return false;
    }
  };

  const reset = () => {
    setFormData({ url: '' });
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    formData,
    errors,
    isSubmitting,
    isSuccess: addUrlMutation.isSuccess && !isSubmitting,
    setFieldValue,
    handleSubmit,
    reset,
  };
};