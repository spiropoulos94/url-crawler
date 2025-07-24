import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export interface ErrorDisplayProps {
  title?: string;
  message?: string;
  error?: Error;
  showRetry?: boolean;
  onRetry?: () => void;
  showDetails?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = "Something went wrong",
  message = "We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.",
  error,
  showRetry = true,
  onRetry,
  showDetails = false,
  className = "",
}) => {
  return (
    <div className={`text-center max-w-md ${className}`}>
      <div className="mb-6">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>

      <p className="text-gray-600 mb-6">{message}</p>

      {showDetails && error && import.meta.env.DEV && (
        <details className="text-left mb-6 p-4 bg-gray-100 rounded-lg">
          <summary className="cursor-pointer font-medium text-gray-700 mb-2">
            Error Details (Development Only)
          </summary>
          <pre className="text-xs text-red-600 whitespace-pre-wrap">
            {error.toString()}
          </pre>
        </details>
      )}

      {showRetry && onRetry && (
        <Button onClick={onRetry} icon={RefreshCw} variant="secondary">
          Try Again
        </Button>
      )}
    </div>
  );
};
