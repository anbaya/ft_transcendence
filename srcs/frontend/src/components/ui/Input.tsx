import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label className="text-[13px] font-medium text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-primary',
            'placeholder:text-muted',
            'focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error focus:border-error focus:ring-error/10',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-error mt-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
