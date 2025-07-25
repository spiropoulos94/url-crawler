import { useEffect } from "react";
import { useError } from "../contexts/ErrorContext";

export function GlobalErrorToast() {
  const { error, clearError } = useError();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded shadow-lg z-50"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span className="sr-only">Error: </span>
      {error}
    </div>
  );
}