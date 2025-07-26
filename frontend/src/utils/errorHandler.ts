import type { AxiosError } from "axios";
import { ValidationError } from "./validation";

export function getErrorMessage(error: unknown): string {
  // Handle validation errors specifically
  if (error instanceof ValidationError) {
    return `Data validation failed: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  const axiosError = error as AxiosError;
  if (axiosError?.response?.data) {
    const data = axiosError.response.data as {
      error?: string;
      message?: string;
    };
    return data.error || data.message || "An error occurred";
  }

  return "An unexpected error occurred";
}

export function handleAuthError(): void {
  localStorage.removeItem("user");
  window.location.href = "/login";
}
