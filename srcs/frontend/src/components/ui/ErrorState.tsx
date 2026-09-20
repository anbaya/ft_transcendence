import React from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ className, title = 'An error occurred', message, onRetry, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center p-6 text-center rounded-lg bg-red-50 border border-red-100',
          className
        )}
        {...props}
      >
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-5 w-5 text-error" />
        </div>
        <h3 className="text-sm font-semibold text-error mb-1">{title}</h3>
        <p className="text-sm text-red-700/80 mb-4 max-w-sm">{message}</p>
        
        {onRetry && (
          <Button variant="destructive" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }
);

ErrorState.displayName = 'ErrorState';
