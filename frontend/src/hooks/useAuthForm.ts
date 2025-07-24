import { useState } from 'react';
import { useAuth } from '../components/providers/AuthProvider';

interface AuthFormData {
  username: string;
  password: string;
}

export const useAuthForm = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();

  const setFieldValue = (field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateForm = (): string | null => {
    if (!formData.username.trim() || !formData.password.trim()) {
      return "Username and password are required";
    }

    if (isRegisterMode && formData.password.length < 6) {
      return "Password must be at least 6 characters long";
    }

    if (isRegisterMode && formData.username.length < 3) {
      return "Username must be at least 3 characters long";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return false;
    }

    setIsLoading(true);
    setError("");

    try {
      if (isRegisterMode) {
        await register({ username: formData.username.trim(), password: formData.password });
        setError("");
        alert("Registration successful! Please log in.");
        setIsRegisterMode(false);
        setFormData({ username: formData.username, password: '' }); // Keep username, clear password
      } else {
        await login({ username: formData.username.trim(), password: formData.password });
      }
      return true;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(
        error.response?.data?.error ||
        `${isRegisterMode ? "Registration" : "Login"} failed`
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setFormData({ username: '', password: '' });
  };

  return {
    isRegisterMode,
    formData,
    error,
    isLoading,
    setFieldValue,
    handleSubmit,
    toggleMode,
  };
};