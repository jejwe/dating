import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: {
      container: 'p-3',
      icon: 16,
      text: 'text-xs',
      button: 'px-2 py-1 text-xs'
    },
    md: {
      container: 'p-4',
      icon: 20,
      text: 'text-sm',
      button: 'px-3 py-1.5 text-sm'
    },
    lg: {
      container: 'p-6',
      icon: 24,
      text: 'text-base',
      button: 'px-4 py-2 text-base'
    }
  };

  const styles = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${styles.container} ${className}`}>
      <div className="flex items-center justify-center w-12 h-12 bg-red-500/10 rounded-full mb-3">
        <AlertCircle size={styles.icon} className="text-red-400" />
      </div>

      <p className={`text-slate-300 mb-3 ${styles.text}`}>
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className={`inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors ${styles.button}`}
        >
          <RefreshCw size={14} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
