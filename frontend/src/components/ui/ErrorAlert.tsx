import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string | null | undefined;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800 flex items-start gap-3 ${className}`}
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm">{message}</p>
    </div>
  );
};
